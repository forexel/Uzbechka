#!/usr/bin/env python3
import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
STATIC_ROOT = ROOT / "dist" if (ROOT / "dist").exists() else ROOT
DB_PATH = Path(os.environ.get("UZBEK_TRAINER_DB", ROOT / "data" / "uzbek_trainer.sqlite3"))
ITERATIONS = 180_000


def db():
  DB_PATH.parent.mkdir(parents=True, exist_ok=True)
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  conn.execute("PRAGMA foreign_keys = ON")
  return conn


def init_db():
  with db() as conn:
    conn.executescript("""
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    """)


def password_hash(password, salt=None):
  salt = salt or secrets.token_bytes(16)
  digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS)
  return f"pbkdf2_sha256${ITERATIONS}${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password, encoded):
  try:
    scheme, iterations, salt_b64, digest_b64 = encoded.split("$", 3)
    if scheme != "pbkdf2_sha256":
      return False
    salt = base64.b64decode(salt_b64)
    expected = base64.b64decode(digest_b64)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
    return hmac.compare_digest(actual, expected)
  except Exception:
    return False


def token_hash(token):
  return hashlib.sha256(token.encode("utf-8")).hexdigest()


class Handler(SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=str(STATIC_ROOT), **kwargs)

  def end_headers(self):
    self.send_header("X-Content-Type-Options", "nosniff")
    super().end_headers()

  def do_POST(self):
    if self.path == "/api/register":
      return self.register()
    if self.path == "/api/login":
      return self.login()
    if self.path == "/api/progress":
      return self.save_progress()
    self.send_error(HTTPStatus.NOT_FOUND)

  def do_GET(self):
    if self.path == "/api/progress":
      return self.get_progress()
    return super().do_GET()

  def read_json(self):
    length = int(self.headers.get("Content-Length", "0"))
    raw = self.rfile.read(length)
    if not raw:
      return {}
    return json.loads(raw.decode("utf-8"))

  def write_json(self, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def current_user_id(self):
    auth = self.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
      return None
    hashed = token_hash(auth.removeprefix("Bearer ").strip())
    with db() as conn:
      row = conn.execute("SELECT user_id FROM sessions WHERE token_hash = ?", (hashed,)).fetchone()
      return row["user_id"] if row else None

  def issue_token(self, conn, user_id):
    token = secrets.token_urlsafe(32)
    conn.execute("INSERT INTO sessions (token_hash, user_id) VALUES (?, ?)", (token_hash(token), user_id))
    return token

  def register(self):
    try:
      payload = self.read_json()
      username = str(payload.get("username", "")).strip().lower()
      password = str(payload.get("password", ""))
      if len(username) < 3 or len(username) > 32:
        return self.write_json(400, {"error": "Логин должен быть от 3 до 32 символов."})
      if not username.replace("_", "").replace("-", "").isalnum():
        return self.write_json(400, {"error": "В логине только буквы, цифры, дефис и подчёркивание."})
      if len(password) < 6:
        return self.write_json(400, {"error": "Пароль должен быть минимум 6 символов."})
      with db() as conn:
        try:
          cur = conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash(password)),
          )
        except sqlite3.IntegrityError:
          return self.write_json(409, {"error": "Такой логин уже есть."})
        user_id = cur.lastrowid
        conn.execute("INSERT INTO progress (user_id, data) VALUES (?, '{}')", (user_id,))
        token = self.issue_token(conn, user_id)
      return self.write_json(200, {"token": token, "username": username, "progress": {}})
    except Exception:
      return self.write_json(500, {"error": "Не удалось зарегистрировать пользователя."})

  def login(self):
    try:
      payload = self.read_json()
      username = str(payload.get("username", "")).strip().lower()
      password = str(payload.get("password", ""))
      with db() as conn:
        row = conn.execute("SELECT id, password_hash FROM users WHERE username = ?", (username,)).fetchone()
        if not row or not verify_password(password, row["password_hash"]):
          return self.write_json(401, {"error": "Неверный логин или пароль."})
        token = self.issue_token(conn, row["id"])
        progress = conn.execute("SELECT data FROM progress WHERE user_id = ?", (row["id"],)).fetchone()
      return self.write_json(200, {"token": token, "username": username, "progress": json.loads(progress["data"] if progress else "{}")})
    except Exception:
      return self.write_json(500, {"error": "Не удалось войти."})

  def get_progress(self):
    user_id = self.current_user_id()
    if not user_id:
      return self.write_json(401, {"error": "Требуется вход."})
    with db() as conn:
      row = conn.execute("SELECT data FROM progress WHERE user_id = ?", (user_id,)).fetchone()
    return self.write_json(200, {"progress": json.loads(row["data"] if row else "{}")})

  def save_progress(self):
    user_id = self.current_user_id()
    if not user_id:
      return self.write_json(401, {"error": "Требуется вход."})
    payload = self.read_json()
    data = payload.get("progress", {})
    if not isinstance(data, dict):
      return self.write_json(400, {"error": "Некорректный прогресс."})
    encoded = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    with db() as conn:
      conn.execute(
        """
        INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
        """,
        (user_id, encoded),
      )
    return self.write_json(200, {"ok": True})


if __name__ == "__main__":
  init_db()
  port = int(os.environ.get("PORT", "8080"))
  server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
  print(f"Uzbek Trainer listening on :{port}")
  server.serve_forever()

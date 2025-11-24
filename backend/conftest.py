import sys
from pathlib import Path
import os

# Ensure backend root is on sys.path so `import app` works in tests.
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Minimal env defaults for tests
os.environ.setdefault("SUPABASE_URL", "http://test.supabase.local")
os.environ.setdefault("SUPABASE_SECRET_KEY", "sb_secret_test_key_for_testing")

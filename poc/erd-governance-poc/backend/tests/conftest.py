import sys
import os
import pytest

# Add parent directory and seed directory to python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
seed_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'seed'))

sys.path.insert(0, backend_dir)
sys.path.insert(0, seed_dir)

from seed_data import seed

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    seed()

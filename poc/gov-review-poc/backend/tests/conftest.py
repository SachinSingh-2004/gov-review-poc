import sys
import os
import pytest

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
seed_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'seed'))

sys.path.insert(0, backend_dir)
sys.path.insert(0, seed_dir)

from seed_demo_data import seed

@pytest.fixture(scope="function", autouse=True)
def setup_database():
    seed()

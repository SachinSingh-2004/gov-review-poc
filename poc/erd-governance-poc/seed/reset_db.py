import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'seed_data.py')))
from seed_data import seed

if __name__ == "__main__":
    print("Resetting and re-seeding database...")
    seed()
    print("Reset complete!")

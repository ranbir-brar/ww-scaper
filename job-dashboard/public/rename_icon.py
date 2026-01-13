import os

original = "bright-yellow-lightning-bolt-icon-glowing-gradient-green-turquoise-background-representing-electricity-power-energy_250994-8964.avif"
target = "favicon.avif"

try:
    if os.path.exists(original):
        if os.path.exists(target):
            os.remove(target)
        os.rename(original, target)
        print("Success: Renamed to favicon.avif")
    else:
        print(f"Error: Original file not found: {original}")
        # List dir to show what's there
        print("Files in current dir:")
        for f in os.listdir("."):
            print(f)
except Exception as e:
    print(f"Error: {e}")

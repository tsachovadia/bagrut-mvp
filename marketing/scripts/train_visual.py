import time
import random
import sys

# ASCII Art / Header
HEADER = """
\033[0;32m
   ____                         _      _    ___ 
  | __ )  __ _  __ _ _ __ _   _| |_   / \  |_ _|
  |  _ \ / _` |/ _` | '__| | | | __| / _ \  | | 
  | |_) | (_| | (_| | |  | |_| | |_ / ___ \ | | 
  |____/ \__,_|\__, |_|   \__,_|\__/_/   \_\___|
               |___/                            
           SYSTEM INITIALIZATION v2.4.0
\033[0m
"""

def rapid_print(text, color_code="\033[0;32m", delay=0.01):
    sys.stdout.write(color_code)
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    sys.stdout.write("\033[0m\n")

def simulate_process(name, duration=1.0):
    print(f"\033[1;33m[PROCESS] {name}...\033[0m")
    end_time = time.time() + duration
    while time.time() < end_time:
        hex_code = ''.join(random.choices('0123456789ABCDEF', k=32))
        loss = random.random()
        print(f"\033[0;32m   > Analyzing Batch {hex_code[:8]}... Loss: {loss:.4f}\033[0m")
        time.sleep(0.05)
    print(f"\033[0;36m[COMPLETE] {name} Processed.\033[0m\n")

def main():
    # Clear screen
    print("\033[2J\033[H", end="")
    
    print(HEADER)
    time.sleep(0.5)
    
    rapid_print("[SYSTEM] Establishing Neural Link...", delay=0.05)
    time.sleep(0.3)
    rapid_print("[SYSTEM] Access Granted. Root privileges enabled.", delay=0.05)
    time.sleep(0.3)
    
    modules = [
        ("Ingesting 5-Unit Mathematics Curriculum", 0.6),
        ("parsing_bagrut_exams_2010_2024", 0.8),
        ("Vectorizing Geometry Theorems", 0.5),
        ("Optimizing Gradient Descent (Epoch 1/500)", 0.7),
        ("Calibrating Final Prediction Models", 0.5)
    ]
    
    for name, duration in modules:
        simulate_process(name, duration)
        
    print("\033[1;32m" + "="*50)
    print(" TRAINING COMPLETE. MODEL READY FOR DEPLOYMENT.")
    print("="*50 + "\033[0m")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[ABORTED]")

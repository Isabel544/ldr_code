import matplotlib.pyplot as plt

# Data extracted from table
checkpoints = [
    200, 400, 600, 800, 1000, 1200, 1400, 1600, 
    1800, 2000, 2200, 2400, 2600, 2800, 3000
]
val_loss = [
    0.1352, 0.2285, 0.0790, 0.2288, 0.1269, 0.1145, 0.2059, 0.1175, 
    0.1661, 0.2158, 0.15997, 0.1046, 0.1535, 0.1544, 0.1923
]
rollout_loss = [
    0.1232, 71.8479, 0.1631, 154.3882, 0.8363, 0.4372, 0.1117, 0.1173, 
    0.0809, 0.2141, 0.0600, 1.2366, 30.6232, 0.0697, 0.1826
]

# Find minimums
min_val_idx = val_loss.index(min(val_loss))
min_val_cp = checkpoints[min_val_idx]
min_val_val = val_loss[min_val_idx]

min_roll_idx = rollout_loss.index(min(rollout_loss))
min_roll_cp = checkpoints[min_roll_idx]
min_roll_val = rollout_loss[min_roll_idx]

# Create plot
plt.figure(figsize=(10, 6))

plt.plot(checkpoints, val_loss, label='Validation Loss', marker='o', color='tab:blue', linewidth=2)
plt.plot(checkpoints, rollout_loss, label='Rollout Loss', marker='s', color='tab:orange', linewidth=2)

# Use log scale on Y-axis due to high spikes in rollout loss (e.g. 154.38)
plt.yscale('log')

# Highlight minimum points
plt.scatter(min_val_cp, min_val_val, color='blue', s=150, zorder=5, edgecolors='black')
plt.annotate(
    f'Min Val Loss\n(CP {min_val_cp}: {min_val_val})', 
    (min_val_cp, min_val_val), 
    textcoords="offset points", 
    xytext=(-30, -35), 
    arrowprops=dict(arrowstyle="->", color='blue', lw=1.5),
    fontweight='bold', color='tab:blue'
)

plt.scatter(min_roll_cp, min_roll_val, color='orange', s=150, zorder=5, edgecolors='black')
plt.annotate(
    f'Min Rollout Loss\n(CP {min_roll_cp}: {min_roll_val})', 
    (min_roll_cp, min_roll_val), 
    textcoords="offset points", 
    xytext=(15, 20), 
    arrowprops=dict(arrowstyle="->", color='orange', lw=1.5),
    fontweight='bold', color='tab:orange'
)

# Formatting
plt.title('Validation Loss vs. Rollout Loss Across Checkpoints', fontsize=14, fontweight='bold')
plt.xlabel('Checkpoint', fontsize=12)
plt.ylabel('Loss (Log Scale)', fontsize=12)
plt.xticks(checkpoints, rotation=45)
plt.grid(True, which="both", linestyle="--", alpha=0.5)
plt.legend(fontsize=11)
plt.tight_layout()

# Display plot
plt.show()
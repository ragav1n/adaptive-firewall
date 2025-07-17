import pyshark
from datetime import datetime
from collections import defaultdict
from .flow_utils import extract_features

def capture_live(interface="en0", timeout=60):
    print(f"[*] Starting capture on {interface} for {timeout}s...")
    cap = pyshark.LiveCapture(interface=interface)

    flow_data = defaultdict(list)
    start_time = datetime.now()

    for pkt in cap.sniff_continuously(packet_count=0):
        if (datetime.now() - start_time).seconds > timeout:
            break

        try:
            flow_id, features = extract_features(pkt)
            if flow_id:
                flow_data[flow_id].append(features)
        except Exception as e:
            print(f"[!] Packet parse error: {e}")

    cap.close()
    print(f"[+] {len(flow_data)} flows captured.")
    return flow_data

if __name__ == "__main__":
    flows = capture_live()
    for fid, packets in flows.items():
        print(f"{fid}: {len(packets)} packets")

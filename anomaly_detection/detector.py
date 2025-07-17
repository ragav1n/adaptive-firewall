import statistics

def analyze_flows(flow_data):
    suspicious_flows = []

    for flow_id, packets in flow_data.items():
        pkt_count = len(packets)
        total_bytes = sum(pkt["length"] for pkt in packets)
        avg_pkt_size = total_bytes / pkt_count if pkt_count else 0

        flag_counts = {"SYN": 0, "ACK": 0, "FIN": 0}
        for pkt in packets:
            flags = pkt.get("flags", "").upper()
            for flag in flag_counts:
                if flag in flags:
                    flag_counts[flag] += 1

        if flag_counts["SYN"] > 10 and pkt_count < 15:
            reason = f"Possible SYN flood: {flag_counts['SYN']} SYNs, {pkt_count} packets"
            suspicious_flows.append((flow_id, reason))

        elif avg_pkt_size < 60 and pkt_count > 100:
            reason = f"Suspicious small-packet spam: avg size {avg_pkt_size:.1f}"
            suspicious_flows.append((flow_id, reason))

    return suspicious_flows

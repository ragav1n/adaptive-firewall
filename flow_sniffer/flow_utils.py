def extract_features(pkt):
    try:
        ip = pkt.ip
        proto = pkt.transport_layer
        src = ip.src
        dst = ip.dst
        sport = pkt[pkt.transport_layer].srcport
        dport = pkt[pkt.transport_layer].dstport

        flow_id = f"{src}:{sport} -> {dst}:{dport} ({proto})"

        features = {
            "timestamp": pkt.sniff_time.isoformat(),
            "length": int(pkt.length),
            "flags": getattr(pkt.tcp, "flags", "") if proto == "TCP" else "",
        }

        return flow_id, features
    except AttributeError:
        return None, None

def calculate_cooling_load(area: int, windows: int, floor: str) -> tuple[int, str]:
    """
    Calculate BTU cooling load based on room parameters.
    Industry standard: ~120 BTU/sq ft base load
    """
    base_load = area * 120
    window_load = windows * 500          # each window adds ~500 BTU
    floor_load = 500 if floor.lower() in ("top", "terrace", "penthouse") else 0
    occupancy_load = 400                 # standard 2-person occupancy

    total_load = base_load + window_load + floor_load + occupancy_load

    if total_load <= 9000:
        ton = "0.75 Ton"
    elif total_load <= 12000:
        ton = "1 Ton"
    elif total_load <= 18000:
        ton = "1.5 Ton"
    elif total_load <= 24000:
        ton = "2 Ton"
    else:
        ton = "2.5 Ton"

    return total_load, ton

def format_location_options(candidates: list[str]) -> str:
    return "\n".join(f"- {option}" for option in candidates)

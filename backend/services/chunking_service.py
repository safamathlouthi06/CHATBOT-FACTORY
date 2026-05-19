def chunk_text(text: str):
    """
    Découpe le texte en chunks avec overlap
    """

    chunk_size = 300
    chunk_overlap = 50
    separators = ["\n\n", "\n", ".", " "]

    text = text.strip()
    if not text:
        return []

    chunks = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + chunk_size, length)

        if end < length:
            for sep in separators:
                idx = text.rfind(sep, start, end)
                if idx != -1 and idx > start:
                    end = idx + len(sep)
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        next_start = end - chunk_overlap
        if next_start <= start:
            next_start = end
        start = next_start

    return chunks

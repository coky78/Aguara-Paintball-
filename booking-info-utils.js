export function parseBookingInfo(text = "") {
  const lines = String(text).split(/\r?\n/);
  const aliasPattern = /^(alias(?:\s+de\s+transferencia|\s+para\s+transferencia)?|alias\s+para\s+transferir)\s*[:\-]\s*(.+)$/i;
  const aliasCandidate = /^[a-z0-9][a-z0-9._-]{2,}$/i;
  let alias = "";
  let aliasHint = false;
  let aliasHintDistance = 0;

  const parsedLines = lines.map((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(aliasPattern);
    if (match) {
      const value = match[2].trim();
      if (value) alias = value;
      aliasHint = true;
      aliasHintDistance = 0;
      return { type: "alias", label: match[1].trim(), value };
    }

    if (aliasHint) {
      aliasHintDistance += 1;
      if (aliasHintDistance <= 3 && trimmed && aliasCandidate.test(trimmed)) {
        alias = trimmed;
        aliasHint = false;
        return { type: "alias", label: "Alias de transferencia", value: trimmed };
      }
      if (aliasHintDistance >= 3) aliasHint = false;
    }

    if (/\balias\b/i.test(trimmed)) {
      aliasHint = true;
      aliasHintDistance = 0;
    }

    return { type: "text", value: line };
  });

  return { alias, lines: parsedLines };
}

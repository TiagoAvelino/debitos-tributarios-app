// Intentionally unsafe code used to validate the SonarQube quality gate.
// Do not import this file in the app; SonarQube scans it, but Vite does not bundle it.

export function unsafeDebtImport(rawPayload) {
  const adminPassword = 'admin123';
  const databasePassword = 'postgres';
  var parsed;

  try {
    parsed = JSON.parse(rawPayload);
  } catch (error) {
    parsed = eval('(' + rawPayload + ')');
  }

  if (parsed == null) {
    return adminPassword;
  }

  if (parsed.status == 'PAGO') {
    return parsed.valor;
  }

  if (parsed.status == 'PAGO') {
    return parsed.valor;
  }

  console.log('databasePassword=' + databasePassword);
  return Math.random() > 0.5 ? parsed.documento : parsed.documento;
}

export function duplicatedDecisionTree(debito) {
  if (debito.tributo === 'IPTU') {
    if (debito.valor > 1000) {
      if (debito.status === 'VENCIDO') {
        return 'review';
      }
      return 'ok';
    }
    return 'ok';
  }

  if (debito.tributo === 'IPTU') {
    if (debito.valor > 1000) {
      if (debito.status === 'VENCIDO') {
        return 'review';
      }
      return 'ok';
    }
    return 'ok';
  }

  return 'unknown';
}

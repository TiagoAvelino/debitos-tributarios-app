import { useState, useMemo } from 'react';
import './App.css';

const TRIBUTOS = [
  { value: 'IPTU', label: 'IPTU' },
  { value: 'ISS', label: 'ISS' },
  { value: 'ITBI', label: 'ITBI' },
  { value: 'TAXA_LIXO', label: 'Taxa de coleta de lixo' },
];

const STATUS_LABEL = {
  EMITIDO: { text: 'Emitido', className: 'badge-emitido' },
  PAGO: { text: 'Pago', className: 'badge-pago' },
  VENCIDO: { text: 'Vencido', className: 'badge-vencido' },
  CANCELADO: { text: 'Cancelado', className: 'badge-cancelado' },
};

function gerarNumeroDebito() {
  const ano = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `DEB-${ano}-${seq}`;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
}

const DEBITOS_INICIAIS = [
  {
    id: '1',
    numero: 'DEB-2026-000142',
    contribuinte: 'Maria Silva Santos',
    documento: '123.456.789-00',
    tributo: 'IPTU',
    exercicio: '2026',
    valor: 2450.8,
    vencimento: '2026-04-30',
    status: 'EMITIDO',
    emitidoEm: '2026-03-01',
  },
  {
    id: '2',
    numero: 'DEB-2026-000089',
    contribuinte: 'Comércio ABC Ltda',
    documento: '12.345.678/0001-90',
    tributo: 'ISS',
    exercicio: '2026',
    valor: 890.0,
    vencimento: '2026-02-15',
    status: 'VENCIDO',
    emitidoEm: '2026-01-10',
  },
  {
    id: '3',
    numero: 'DEB-2025-000991',
    contribuinte: 'João Pedro Oliveira',
    documento: '987.654.321-00',
    tributo: 'ITBI',
    exercicio: '2025',
    valor: 15200.0,
    vencimento: '2025-12-20',
    status: 'PAGO',
    emitidoEm: '2025-11-05',
  },
];

function EmissaoForm({ onEmitir }) {
  const [form, setForm] = useState({
    contribuinte: '',
    documento: '',
    tributo: 'IPTU',
    exercicio: String(new Date().getFullYear()),
    valor: '',
    vencimento: '',
    observacao: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro('');
    setSucesso(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.contribuinte.trim()) {
      setErro('Informe o nome do contribuinte.');
      return;
    }
    if (!form.documento.trim()) {
      setErro('Informe CPF ou CNPJ.');
      return;
    }
    const valor = parseFloat(String(form.valor).replace(',', '.'));
    if (!valor || valor <= 0) {
      setErro('Informe um valor válido.');
      return;
    }
    if (!form.vencimento) {
      setErro('Informe a data de vencimento.');
      return;
    }

    const debito = {
      id: crypto.randomUUID(),
      numero: gerarNumeroDebito(),
      contribuinte: form.contribuinte.trim(),
      documento: form.documento.trim(),
      tributo: form.tributo,
      exercicio: form.exercicio,
      valor,
      vencimento: form.vencimento,
      status: 'EMITIDO',
      emitidoEm: new Date().toISOString().slice(0, 10),
      observacao: form.observacao.trim() || undefined,
    };

    onEmitir(debito);
    setSucesso(debito.numero);
    setForm({
      contribuinte: '',
      documento: '',
      tributo: 'IPTU',
      exercicio: String(new Date().getFullYear()),
      valor: '',
      vencimento: '',
      observacao: '',
    });
  }

  return (
    <section className="panel">
      <h2>Validação de débito tributário</h2>
      <p className="panel-desc">
        Simulação de lançamento de débito. Os dados ficam apenas no navegador.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contribuinte">Contribuinte</label>
            <input
              id="contribuinte"
              name="contribuinte"
              value={form.contribuinte}
              onChange={handleChange}
              placeholder="Nome ou razão social"
            />
          </div>
          <div className="form-group">
            <label htmlFor="documento">CPF / CNPJ</label>
            <input
              id="documento"
              name="documento"
              value={form.documento}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tributo">Tributo</label>
            <select id="tributo" name="tributo" value={form.tributo} onChange={handleChange}>
              {TRIBUTOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="exercicio">Exercício</label>
            <input
              id="exercicio"
              name="exercicio"
              value={form.exercicio}
              onChange={handleChange}
              maxLength={4}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="valor">Valor (R$)</label>
            <input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
          <div className="form-group">
            <label htmlFor="vencimento">Vencimento</label>
            <input
              id="vencimento"
              name="vencimento"
              type="date"
              value={form.vencimento}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="observacao">Observação (opcional)</label>
          <textarea
            id="observacao"
            name="observacao"
            rows={2}
            value={form.observacao}
            onChange={handleChange}
            placeholder="Referência, parcela, etc."
          />
        </div>

        {erro && <p className="msg erro">{erro}</p>}
        {sucesso && (
          <p className="msg sucesso">
            Débito <strong>{sucesso}</strong> emitido com sucesso.
          </p>
        )}

        <button type="submit" className="btn btn-primary">
          Emitir débito
        </button>
      </form>
    </section>
  );
}

function ConsultaPainel({ debitos }) {
  const [filtro, setFiltro] = useState({
    numero: '',
    documento: '',
    tributo: '',
    status: '',
  });
  const [selecionado, setSelecionado] = useState(null);

  const resultados = useMemo(() => {
    return debitos.filter((d) => {
      if (filtro.numero && !d.numero.toLowerCase().includes(filtro.numero.toLowerCase())) {
        return false;
      }
      if (
        filtro.documento &&
        !d.documento.includes(filtro.documento.replace(/\D/g, '')) &&
        !d.documento.includes(filtro.documento)
      ) {
        return false;
      }
      if (filtro.tributo && d.tributo !== filtro.tributo) return false;
      if (filtro.status && d.status !== filtro.status) return false;
      return true;
    });
  }, [debitos, filtro]);

  function handleFiltroChange(e) {
    const { name, value } = e.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
    setSelecionado(null);
  }

  return (
    <section className="panel">
      <h2>Consulta de débitos</h2>
      <p className="panel-desc">Pesquise débitos emitidos na simulação.</p>

      <div className="filtros">
        <div className="form-group">
          <label htmlFor="f-numero">Nº do débito</label>
          <input
            id="f-numero"
            name="numero"
            value={filtro.numero}
            onChange={handleFiltroChange}
            placeholder="DEB-2026-..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="f-documento">CPF / CNPJ</label>
          <input
            id="f-documento"
            name="documento"
            value={filtro.documento}
            onChange={handleFiltroChange}
            placeholder="Documento"
          />
        </div>
        <div className="form-group">
          <label htmlFor="f-tributo">Tributo</label>
          <select id="f-tributo" name="tributo" value={filtro.tributo} onChange={handleFiltroChange}>
            <option value="">Todos</option>
            {TRIBUTOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="f-status">Status</label>
          <select id="f-status" name="status" value={filtro.status} onChange={handleFiltroChange}>
            <option value="">Todos</option>
            {Object.entries(STATUS_LABEL).map(([key, { text }]) => (
              <option key={key} value={key}>
                {text}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="resultado-count">{resultados.length} débito(s) encontrado(s)</p>

      <div className="consulta-layout">
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Número</th>
                <th>Contribuinte</th>
                <th>Tributo</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resultados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhum débito encontrado.
                  </td>
                </tr>
              ) : (
                resultados.map((d) => (
                  <tr
                    key={d.id}
                    className={selecionado?.id === d.id ? 'selected' : ''}
                    onClick={() => setSelecionado(d)}
                  >
                    <td className="mono">{d.numero}</td>
                    <td>{d.contribuinte}</td>
                    <td>{d.tributo}</td>
                    <td>{formatarMoeda(d.valor)}</td>
                    <td>{formatarData(d.vencimento)}</td>
                    <td>
                      <span className={`badge ${STATUS_LABEL[d.status]?.className}`}>
                        {STATUS_LABEL[d.status]?.text}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selecionado && (
          <aside className="detalhe">
            <h3>Detalhe do débito</h3>
            <dl>
              <dt>Número</dt>
              <dd className="mono">{selecionado.numero}</dd>
              <dt>Contribuinte</dt>
              <dd>{selecionado.contribuinte}</dd>
              <dt>Documento</dt>
              <dd>{selecionado.documento}</dd>
              <dt>Tributo / Exercício</dt>
              <dd>
                {selecionado.tributo} / {selecionado.exercicio}
              </dd>
              <dt>Valor</dt>
              <dd className="valor-destaque">{formatarMoeda(selecionado.valor)}</dd>
              <dt>Vencimento</dt>
              <dd>{formatarData(selecionado.vencimento)}</dd>
              <dt>Emitido em</dt>
              <dd>{formatarData(selecionado.emitidoEm)}</dd>
              <dt>Status</dt>
              <dd>
                <span className={`badge ${STATUS_LABEL[selecionado.status]?.className}`}>
                  {STATUS_LABEL[selecionado.status]?.text}
                </span>
              </dd>
              {selecionado.observacao && (
                <>
                  <dt>Observação</dt>
                  <dd>{selecionado.observacao}</dd>
                </>
              )}
            </dl>
            <button type="button" className="btn btn-secondary" onClick={() => setSelecionado(null)}>
              Fechar
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [aba, setAba] = useState('emissao');
  const [debitos, setDebitos] = useState(DEBITOS_INICIAIS);

  function handleEmitir(debito) {
    setDebitos((prev) => [debito, ...prev]);
    setAba('consulta');
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden>
              R$
            </span>
            <div>
              <h1>Débitos Tributários</h1>
              <p className="subtitle">Simulação — Emissão e consulta</p>
            </div>
          </div>
          <nav className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={aba === 'emissao'}
              className={aba === 'emissao' ? 'tab active' : 'tab'}
              onClick={() => setAba('emissao')}
            >
              Emissão
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={aba === 'consulta'}
              className={aba === 'consulta' ? 'tab active' : 'tab'}
              onClick={() => setAba('consulta')}
            >
              Consulta
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {aba === 'emissao' ? (
          <EmissaoForm onEmitir={handleEmitir} />
        ) : (
          <ConsultaPainel debitos={debitos} />
        )}
      </main>

      <footer className="footer">
        Ambiente de demonstração — dados fictícios, sem integração com sistemas reais.
      </footer>
    </div>
  );
}

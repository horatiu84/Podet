import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './App.css';





const TIPURI_PODET = {
  'D1': 1.90,
  'D2': 2.90,
  'D3': 3.90,
  'D4': 4.90
};

const TIPURI_BETON = ['C12/15', 'C16/20', 'C25/30', 'C30/37', 'C35/45'];

function App() {

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Adaugă titlu
    doc.setFontSize(16);
    doc.text(`Cantitati Podet km ${kmPodet}`, 14, 20);

    // Caracteristici podeț
    doc.autoTable({
      startY: 30,
      head: [['Caracteristici Podet', 'Valoare']],
      body: [
        ['Tip Podet', `Podet dalat ${tipPodet}`],
        ['Latime Podet', `${TIPURI_PODET[tipPodet]} m`],
        ['Lungime Podet', `${lungimePodet} m`]
      ]
    });

    // Fundații și elevații
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Element beton', 'Volum Beton', 'Tip Beton', 'Cofraj']],
      body: [
        ['Fundatie (2 buc)', `${(rezultate.volumFundatie * 2).toFixed(2)} m³`, fundatie.tipBeton, `${(rezultate.cofrajFundatie * 2).toFixed(2)} m²`],
        ['Elevatie (2 buc)', `${(rezultate.volumElevatie * 2).toFixed(2)} m³`, elevatie.tipBeton, `${(rezultate.cofrajElevatie * 2).toFixed(2)} m²`]
      ]
    });

    // Dale
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Tip Dale', 'Cantitate']],
      body: [
        ['Dale Marginale', `${rezultate.daleMarginale} buc`],
        ['Dale in Camp', `${rezultate.daleCamp} buc`],
        ['Total Dale', `${rezultate.daleTotalBucati} buc`]
      ]
    });

    // Hidroizolație și alte elemente
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Element', 'Cantitate']],
      body: [
        ['Strat Hidroizolatie', `${(lungimePodet * TIPURI_PODET[tipPodet]).toFixed(2)} m²`],
        ['Protectie Hidroizolatie', `${(lungimePodet * TIPURI_PODET[tipPodet]).toFixed(2)} m²`],
        ['Hidroizolatie elevatii', `${(elevatie.lungime * elevatie.inaltime * 2).toFixed(2)} m²`],
        ['Parapet tip H2', '12 m'],
        ['Coronament ', `${rezultate.volumCoronament * 2} m³`]
      ]
    });

    doc.save(`Podet_km_${kmPodet}.pdf`);
  };

  const [fundatie, setFundatie] = useState({
    lungime: '',
    latime: '',
    inaltime: '',
    tipBeton: 'C12/15'
  });

  const [elevatie, setElevatie] = useState({
    lungime: '',
    latime: '',
    inaltime: '',
    tipBeton: 'C12/15'
  });

  const [coronament, setCoronament] = useState({
    latime: '',
    inaltime: '',
    tipBeton: 'C12/15'
  });

  const [lungimePodet, setLungimePodet] = useState('');
  const [kmPodet, setKmPodet] = useState('');
  const [tipPodet, setTipPodet] = useState('D1');

  const [rezultate, setRezultate] = useState({
    volumFundatie: 0,
    volumElevatie: 0,
    volumCoronament: 0,
    volumTotal: 0,
    volumTotalDublu: 0,
    cofrajFundatie: 0,
    cofrajElevatie: 0,
    cofrajTotal: 0,
    cofrajTotalDublu: 0,
    daleMarginale: 0,
    daleCamp: 0,
    daleTotalBucati: 0
  });

  const calculeazaRezultate = (e) => {
    e.preventDefault();

    // Calcul volume
    const volumFundatie = fundatie.lungime * fundatie.latime * fundatie.inaltime;
    const volumElevatie = elevatie.lungime * elevatie.latime * elevatie.inaltime;
    const volumCoronament = coronament.inaltime * coronament.latime * TIPURI_PODET[tipPodet];
    const volumTotal = volumFundatie + volumElevatie;
    const volumTotalDublu = volumTotal * 2;

    // Calcul cofraje
    const cofrajFundatie = 2 * (fundatie.lungime * fundatie.inaltime +
      fundatie.latime * fundatie.inaltime);
    const cofrajElevatie = 2 * (elevatie.lungime * elevatie.inaltime +
      elevatie.latime * elevatie.inaltime);
    const cofrajTotal = cofrajFundatie + cofrajElevatie;
    const cofrajTotalDublu = cofrajTotal * 2;

    // Calcul dale
    const daleMarginale = 2;
    const daleCamp = Math.ceil(lungimePodet - 2);
    const daleTotalBucati = daleMarginale + daleCamp;

    setRezultate({
      volumFundatie: volumFundatie.toFixed(2),
      volumElevatie: volumElevatie.toFixed(2),
      volumCoronament: volumCoronament.toFixed(2),
      volumTotal: volumTotal.toFixed(2),
      volumTotalDublu: volumTotalDublu.toFixed(2),
      cofrajFundatie: cofrajFundatie.toFixed(2),
      cofrajElevatie: cofrajElevatie.toFixed(2),
      cofrajTotal: cofrajTotal.toFixed(2),
      cofrajTotalDublu: cofrajTotalDublu.toFixed(2),
      daleMarginale,
      daleCamp,
      daleTotalBucati
    });
  };

  return (
    <div className="calculator-container">
      <h1>Calculator Construcții Podețe</h1>

      <form onSubmit={calculeazaRezultate}>


        <div className="section tip-podet">

          <h2>Podeț :  </h2>
          <div className="input-group">
            <label>Km podeț:</label>
            <input type='text' value={kmPodet} onChange={(e) => setKmPodet(e.target.value)} />
            <label>Selectează tipul de podeț:</label>
            <select
              value={tipPodet}
              onChange={(e) => setTipPodet(e.target.value)}
              className="select-tip-podet"
            >
              {Object.entries(TIPURI_PODET).map(([tip, latime]) => (
                <option key={tip} value={tip}>
                  Podeț dalat {tip} (Lățime: {latime}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="section">
          <h2>Lungime Podeț</h2>
          <div className="input-group">
            <label>Lungime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={lungimePodet}
              onChange={(e) => setLungimePodet(e.target.value)}
            />
          </div>
        </div>

        <div className="section">
          <h2>Fundație</h2>
          <div className="input-group">
            <label>Lungime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={fundatie.lungime}
              onChange={(e) => setFundatie({ ...fundatie, lungime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Lățime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={fundatie.latime}
              onChange={(e) => setFundatie({ ...fundatie, latime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Înălțime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={fundatie.inaltime}
              onChange={(e) => setFundatie({ ...fundatie, inaltime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Tip Beton:</label>
            <select
              value={fundatie.tipBeton}
              onChange={(e) => setFundatie({ ...fundatie, tipBeton: e.target.value })}
              className="select-beton"
            >
              {TIPURI_BETON.map(tip => (
                <option key={tip} value={tip}>{tip}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section">
          <h2>Elevație</h2>
          <div className="input-group">
            <label>Lungime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={elevatie.lungime}
              onChange={(e) => setElevatie({ ...elevatie, lungime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Lățime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={elevatie.latime}
              onChange={(e) => setElevatie({ ...elevatie, latime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Înălțime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={elevatie.inaltime}
              onChange={(e) => setElevatie({ ...elevatie, inaltime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Tip Beton:</label>
            <select
              value={elevatie.tipBeton}
              onChange={(e) => setElevatie({ ...elevatie, tipBeton: e.target.value })}
              className="select-beton"
            >
              {TIPURI_BETON.map(tip => (
                <option key={tip} value={tip}>{tip}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section">
          <h2>Coronament</h2>


          <div className="input-group">
            <label>Lățime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={coronament.latime}
              onChange={(e) => setCoronament({ ...coronament, latime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Înălțime (m):</label>
            <input
              type="number"
              min="0"
              step=".01"
              value={coronament.inaltime}
              onChange={(e) => setCoronament({ ...coronament, inaltime: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Tip Beton:</label>
            <select
              value={coronament.tipBeton}
              onChange={(e) => setCoronament({ ...coronament, tipBeton: e.target.value })}
              className="select-beton"
            >
              {TIPURI_BETON.map(tip => (
                <option key={tip} value={tip}>{tip}</option>
              ))}
            </select>
          </div>
        </div>



        <button type="submit">Calculează</button>

        <div className="results">
          <h1>Cantitati Podeț km {kmPodet}</h1>

          <div className="results-section">
            <h3>Caracteristici Podeț:</h3>
            <div className="podet-info">
              <div className="info-row">
                <span>Tip Podeț:</span>
                <span className="highlight">Podeț dalat {tipPodet}</span>
              </div>
              <div className="info-row">
                <span>Lățime Podeț:</span>
                <span className="highlight">{TIPURI_PODET[tipPodet]} m</span>
              </div>
              <div className="info-row">
                <span>Lungime Podeț:</span>
                <span className="highlight">{lungimePodet} m</span>
              </div>
            </div>
          </div>


          <div className="results-section highlight">
            <h3>Fundatii si elevatii:</h3>
            <div className="results-grid">
              <div className="result-section">
                <h4>Fundație (2 buc)</h4>
                <p>Volum Beton {fundatie.tipBeton}: {(rezultate.volumFundatie * 2).toFixed(2)} m³</p>
                <p>Cofraj: {(rezultate.cofrajFundatie * 2).toFixed(2)} m²</p>
              </div>

              <div className="result-section">
                <h4>Elevație (2 buc)</h4>
                <p>Volum Beton {elevatie.tipBeton}: {(rezultate.volumElevatie * 2).toFixed(2)} m³</p>
                <p>Cofraj: {(rezultate.cofrajElevatie * 2).toFixed(2)} m²</p>
              </div>
            </div>
            <div className="total-section highlight">
              <p>Total Volume:</p>
              <p>Beton {fundatie.tipBeton}: {(rezultate.volumFundatie * 2).toFixed(2)} m³</p>
              <p>Beton {elevatie.tipBeton}: {(rezultate.volumElevatie * 2).toFixed(2)} m³</p>
              <p>Total Cofraj: {rezultate.cofrajTotalDublu} m²</p>
            </div>
          </div>

          <div className="results-section dale">
            <h3> Dale:</h3>
            <div className="dale-results">
              <p>Dale Marginale tip {tipPodet}: <span>{rezultate.daleMarginale} buc</span></p>
              <p>Dale în Câmp tip {tipPodet}: <span>{rezultate.daleCamp} buc</span></p>
              <p className="dale-total">Total Dale tip {tipPodet}: <span>{rezultate.daleTotalBucati} buc</span></p>
            </div>
          </div>

          <div className="results-section waterproofing">
            <h3>Hidroizolație:</h3>
            <div className="waterproofing-results">
              <p>Strat Hidroizolație: <span>{(lungimePodet * TIPURI_PODET[tipPodet]).toFixed(2)} m²</span></p>
              <p>Protectie Hidroizolație 3cm BA8: <span>{(lungimePodet * TIPURI_PODET[tipPodet]).toFixed(2)} m²</span></p>
              <p>Hidroizolație din emulsie bituminoasa pe fetele verticale elevatii: <span>{(elevatie.lungime * elevatie.inaltime * 2).toFixed(2)} m²</span></p>
            </div>
            <h3>Parapet:</h3>
            <div className="waterproofing-results">
              <p>Parapet tip H2: <span>12 m</span></p>
            </div>
            <h3>Coronament:</h3>
            <div className="waterproofing-results">
              <p>Beton {coronament.tipBeton}: <span>{rezultate.volumCoronament} m³/buc x 2 buc ={rezultate.volumCoronament * 2} m³ </span></p>
            </div>
            <h3>Beton panta:</h3>
            <div className="waterproofing-results">
              <p>Beton {coronament.tipBeton}: <span>{(lungimePodet * TIPURI_PODET[tipPodet] * (0.05 + 0.18) / 2).toFixed(2)} m³ </span></p>
            </div>
          </div>

          <button
            onClick={exportToPDF}
            className="export-button"
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Exportă PDF
          </button>

        </div>
      </form>

    </div>
  );
}

export default App;

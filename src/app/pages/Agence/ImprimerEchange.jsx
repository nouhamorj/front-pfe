// src/app/pages/Agence/ImprimerEchange.jsx
import { useState, useEffect } from "react";
import JsBarcode from "jsbarcode";

// Style pour masquer tout sauf le contenu à imprimer
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
      margin: 0;
      padding: 0;
    }
    #print-section, #print-section * {
      visibility: visible;
    }
    #print-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 210mm; /* A4 width */
      height: 297mm; /* A4 height */
      margin: 0;
      padding: 5mm;
      box-sizing: border-box;
    }
    @page {
      size: A4 portrait;
      margin: 0 !important;
    }
    body {
      margin: 0 !important;
    }
  }

  @media screen {
    .no-screen {
      display: none;
    }
  }
`;

export default function ImprimerEchange() {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extraire l'ID depuis l'URL
  const getIdFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    return id && /^\d+$/.test(id) ? id : null;
  };

  const id = getIdFromUrl();

  useEffect(() => {
    if (!id) {
      setError("ID manquant dans l'URL");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/echange/impression/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "Échec du chargement");
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Générer le code-barres et imprimer
  useEffect(() => {
    if (!data) return;

    try {
      JsBarcode(`#barcode`, data.code_barre, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: false,
        margin: 0,
        background: "#fff",
        lineColor: "#000",
      });
    } catch (err) {
      console.error("Erreur JsBarcode:", err);
    }

    // ✅ Délai pour s'assurer que le SVG est généré
    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => clearTimeout(timer);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Chargement du bon échange...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-red-600"> {error || "Données introuvables"}</div>
      </div>
    );
  }

  return (
    <>
      {/*  Injecter les styles d'impression */}
      <style>{printStyles}</style>

      {/* Section à imprimer uniquement */}
      <div id="print-section" className="no-screen">
        <table style={{ width: "100%" }}>
          <tr>
            <td style={{ width: "30%" }}>
              <svg
                id="barcode"
                style={{
                  width: "200px",
                  height: "50px",
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
              <div
                style={{
                  textAlign: "left",
                  letterSpacing: "9px",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {data.code_barre}
              </div>
            </td>

            <td style={{ width: "20%", fontSize:"20px" ,fontWeight: "bold", textAlign: "center" }}>
              {data.agence_dest.libelle}
            </td>

            <td style={{ width: "50%", textAlign: "center" }}>
              <table style={{ width: "100%", marginTop: "20px", marginBottom: "5px" }}>
                <tr>
                  <td style={{ width: "10%" }}></td>
                  <td style={{ fontSize: "14px", padding: "5px", textAlign: "left" }}>
                    <div><b>Expéditeur : {data.fournisseur.nom_page}</b></div>
                    <div><b>Adr:</b> {data.fournisseur.adresse}</div>
                    <div><b>Tél.:</b> {data.fournisseur.tel}</div>
                    <div><b>M/F:</b> {data.fournisseur.tva || "N/A"}</div>
                  </td>
                  <td style={{ width: "20%" }}></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table style={{ width: "100%", marginTop: "10px" }}>
          <tr>
            <td style={{ width: "10%" }}></td>
            <td style={{ width: "80%" }}>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "40px",
                  border: "1px solid #000",
                  padding: "10px",
                  fontWeight: "bold",
                  margin: "10px 0",
                  lineHeight:"25px"
                }}
              >
                ECHANGE N° {data.code_barre}
              </div>
            </td>
            <td style={{ width: "10%", textAlign: "center" }}></td>
          </tr>
        </table>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <div style={{ fontSize: "14px" }}><b>Nom Client :</b> {data.client.nom}</div>
          <div style={{ fontSize: "14px" }}>
            <b>Numéro de téléphone :</b> {data.client.tel} {data.client.tel2 && `/ ${data.client.tel2}`}
          </div>
        </div>
      </div>

      {/* Message à l'écran (non imprimé) */}
      <div className="no-print" style={{ display: "none" }}>
        Impression en cours...
      </div>
    </>
  );
}
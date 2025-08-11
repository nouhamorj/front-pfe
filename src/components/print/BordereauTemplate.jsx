import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import Logo from "assets/logo.svg?react";

const BordereauTemplate = ({ commande, fournisseur, agenceDest, token: tokenProp }) => {
  const barcodeRef = useRef(null);
  const [agenceSource, setAgenceSource] = useState(null);
  const [agenceDestination, setAgenceDestination] = useState(null);
  const [loadingAgences, setLoadingAgences] = useState(true);

  const token = tokenProp || localStorage.getItem('token') || localStorage.getItem('authToken');

  const fetchAgence = async (id) => {
    if (!id || !token) return null;
    try {
      const response = await fetch(`http://localhost:3000/api/agences/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'agence ${id}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadAgences = async () => {
      setLoadingAgences(true);
      const [sourceData, destinationData] = await Promise.all([
        fetchAgence(fournisseur?.id_agence),
        fetchAgence(commande?.agence_dest)
      ]);
      setAgenceSource(sourceData);
      setAgenceDestination(destinationData);
      setLoadingAgences(false);
    };
    if (fournisseur?.id_agence || commande?.agence_dest) {
      loadAgences();
    } else {
      setLoadingAgences(false);
    }
  }, [fournisseur?.id_agence, commande?.agence_dest, token]);

  useEffect(() => {
    if (commande?.code_barre && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, commande.code_barre, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: false
        });
      } catch (error) {
        console.error('Erreur génération code-barres:', error);
      }
    }
  }, [commande?.code_barre]);

  if (!commande || !fournisseur) {
    return <div>Chargement...</div>;
  }

  const prixNum = parseFloat(commande.prix) || 0;
  const ht = prixNum / 1.19;
  const tva = prixNum - ht;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(prix);
  };

  const getTrajetDisplay = () => {
    const cleanLibelle = (libelle) => {
      if (!libelle) return '';
      return libelle.replace(/^Agence\s+/i, '');
    };
    const sourceDisplay = cleanLibelle(agenceSource?.libelle) || fournisseur?.id_agence || '';
    const destDisplay = cleanLibelle(agenceDestination?.libelle) || commande?.agence_dest || '';
    return `${sourceDisplay} >>----- dispatch ---->> ${destDisplay}`;
  };

  return (
    <>
      {/* CSS pour forcer une seule page d'impression */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          html, body {
            width: 210mm;
            /*height: 297mm;*/
            margin: 0 !important;
            padding: 0 !important;
          }
          .bordereau-root {
            width: 200mm !important;
            /*min-height: 287mm !important;*/
            margin: 0 auto !important;
            padding: 5mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            transform: scale(0.98);
            transform-origin: top center;
          }
          .no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        className="bordereau-root"
        style={{
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          maxWidth: '210mm',
          /*minHeight: '297mm',*/
          margin: '0 auto',
          padding: '15px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* En-tête */}
        <table style={{ width: '100%', marginBottom: '10px' }}>
          <tbody>
            <tr>
              <td style={{ width: '40%' }}>
                <div style={{ fontSize: '19px', fontWeight: 'bold', marginBottom: '10px' }}>
                  Bordereaux d&apos;envoi
                </div>
                <canvas ref={barcodeRef} style={{ height: '80px', width: '250px' }}></canvas>
                <div style={{ textAlign: 'left', letterSpacing: '9px', marginTop: '5px', marginLeft:'10px' }}>
                  {commande.code_barre}
                </div>
              </td>
              <td style={{ width: '30%', textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '52px', 
                  fontWeight: 'bold', 
                  letterSpacing: '1px' 
                }}>
                  {agenceDest?.code || ''}
                </div>
              </td>
              <td style={{ width: '20%', fontSize: '30px', fontWeight: 'bold', textAlign: 'center' }}>
                 <Logo className="mx-auto" style={{ height: "40px" }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Date et numéro BL */}
        <table style={{ width: '100%', marginBottom: '10px' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%' }}>
                <div style={{ marginTop: '5px' }}>
                  Date BLF : {formatDate(commande.date_add)}
                </div>
              </td>
              <td style={{ width: '70%' }}>
                <div style={{
                  textAlign: 'center',
                  fontSize: '17px',
                  fontWeight: 'bold',
                  marginTop: '3px',
                  marginBottom: '3px'
                }}>
                  BON DE LIVRAISON N° {commande.code_barre}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Trajet */}
        <div style={{
          textAlign: 'center',
          fontSize: '25px',
          marginTop: '12px',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          {loadingAgences ? (
            <span style={{ fontSize: '16px', fontStyle: 'italic' }}></span>
          ) : (
            getTrajetDisplay()
          )}
        </div>

        {/* Expéditeur / Destinataire */}
        <table style={{ width: '100%', marginTop: '20px', marginBottom: '5px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{
                fontSize: '14px',
                border: '1px solid #000',
                padding: '5px',
                width: '50%',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                Expéditeur
              </td>
              <td style={{
                fontSize: '14px',
                border: '1px solid #000',
                padding: '5px',
                width: '50%',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                Destinataire
              </td>
            </tr>
            <tr>
              <td style={{
                fontSize: '14px',
                border: '1px solid #000',
                padding: '5px',
                width: '50%',
                verticalAlign: 'top'
              }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>{fournisseur.nom_page}</strong>
                  {fournisseur.exo === 2 && <><br />{fournisseur.nom_page}</>}
                </div>
                <div><strong>Adresse : </strong>{fournisseur.adresse}</div>
                <div><strong>Tél. : </strong>{fournisseur.tel}</div>
                {fournisseur.exo === 1 ? (
                  <div><strong>M/F : </strong>{fournisseur.tva}</div>
                ) : (
                  <div><strong>CIN : </strong>{fournisseur.tva?.slice(0, -3) + 'xxx'}</div>
                )}
              </td>
              <td style={{
                fontSize: '14px',
                border: '1px solid #000',
                padding: '5px',
                width: '50%',
                verticalAlign: 'top'
              }}>
                <div style={{ marginBottom: '5px' }}>
                  {commande.nom}
                  <br />
                  <span><strong>Tél. : </strong>{commande.tel}
                    {commande.tel2 && ` / ${commande.tel2}`}
                  </span>
                </div>
                <div>
                  <strong>Adresse : </strong>
                  {`${commande.adresse} ${commande.localite} ${commande.ville} ${commande.gouvernerat}`}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tableau produits */}
        <table style={{ 
          width: '100%', 
          marginTop: '20px', 
          marginBottom: '5px', 
          fontSize: '15px',
          borderCollapse: 'collapse'
        }}>
          <tbody>
            <tr>
              <th style={{ 
                width: '60%', 
                textAlign: 'center', 
                border: '1px solid #000',
                padding: '5px',
                backgroundColor: '#f5f5f5'
              }}>
                Désignation
              </th>
              <th style={{ 
                width: '10%', 
                textAlign: 'center', 
                border: '1px solid #000',
                padding: '5px',
                backgroundColor: '#f5f5f5'
              }}>
                Quantité
              </th>
              <th style={{ 
                width: '15%', 
                textAlign: 'center', 
                border: '1px solid #000',
                padding: '5px',
                backgroundColor: '#f5f5f5'
              }}>
                Montant Total
              </th>
            </tr>
            <tr>
              <td style={{ padding: '5px', border: '1px solid #000' }}>
                {commande.designation}
                {commande.msg && (
                  <>
                    <hr style={{ margin: '5px 0' }} />
                    {commande.msg}
                  </>
                )}
                {commande.echange === '1' && (
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
                    ÉCHANGE {commande.article} ({commande.nb_echange} articles)
                  </div>
                )}
              </td>
              <td style={{ 
                padding: '5px', 
                textAlign: 'center', 
                border: '1px solid #000' 
              }}>
                {commande.nb_article}
              </td>
              <td style={{ 
                padding: '5px', 
                textAlign: 'center', 
                border: '1px solid #000' 
              }}>
                {prixNum === 0 ? '0,000' : formatPrix(ht)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section fragile, échange, totaux */}
        <table style={{ width: '100%', marginTop: '20px' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', textAlign: 'left' }}>
                {commande.fragile == '1' && (
                  <img 
                    src="/images/fragile.jpeg" 
                    style={{ height: '100px' }} 
                    alt="Fragile" 
                  />
                )}
              </td>
              <td style={{ width: '30%' }}>
                <div style={{
                  textAlign: 'center',
                  fontSize: '40px',
                  color: 'red',
                  fontWeight: 'bold'
                }}>
                  {commande.echange == '1' && 'ÉCHANGE'}
                </div>
              </td>
              <td style={{ width: '40%' }}>
                <div style={{ textAlign: 'right' }}>
                  {prixNum === 0 ? (
                    <>
                      <div style={{ borderBottom: '1px solid #000', lineHeight: '33px' }}>
                        Total Produit : 0,000 DT
                      </div>
                      <div style={{ borderBottom: '1px solid #000', lineHeight: '33px' }}>
                        Frais de livraison HT : 0,000 DT
                      </div>
                      <div style={{ borderBottom: '1px solid #000', lineHeight: '33px' }}>
                        TVA (19%) : 0,000 DT
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '15px',
                        borderBottom: '1px solid #000',
                        lineHeight: '33px'
                      }}>
                        Total en TTC : 0,000 DT
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ borderBottom: '1px solid #000', lineHeight: '33px' }}>
                        Total Produit : {formatPrix(ht)} DT
                      </div>
                      <div style={{ borderBottom: '1px solid #000', lineHeight: '33px' }}>
                        TVA (0,19) : {formatPrix(tva)} DT
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        borderBottom: '1px solid #000',
                        lineHeight: '33px'
                      }}>
                        Total en TTC : {formatPrix(prixNum)} DT
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Mode de paiement */}
        <table style={{
          width: '100%',
          marginTop: '20px',
          marginBottom: '5px',
          fontSize: '16px',
          borderCollapse: 'collapse'
        }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '10px' }}>
                {(commande.mode === 'Espèces' || commande.ouvrir == 1) ? 'Espèces' : commande.mode}
              </td>
              <td style={{ border: '1px solid #000', padding: '10px' }}>
                Ouvrir le colis : {
                  (commande.ouvrir === 'Non' || commande.ouvrir == 0) ? 'Non' : 
                  (commande.ouvrir === 'Oui' || commande.ouvrir == 1) ? 'Oui' : 
                  commande.ouvrir
                }
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          marginTop: '20px'
        }}>
          Adresse : Immeuble Marzouk, Bouhsina Sousse<br />
          Matricule Fiscal : XXX-XXXXXX
        </div>
      </div>
    </>
  );
};

export default BordereauTemplate;
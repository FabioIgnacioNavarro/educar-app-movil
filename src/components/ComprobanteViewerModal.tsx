import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { Button } from "./Button";
import { getAccessToken } from "../utils/storage";

interface ComprobanteViewerModalProps {
  visible: boolean;
  onClose: () => void;
  archivoUrl: string | null;
  nombreArchivo: string;
  authToken?: string | null;
  title?: string;
}

export function ComprobanteViewerModal({
  visible,
  onClose,
  archivoUrl,
  nombreArchivo,
  authToken: propToken,
  title = "Comprobante de Pago",
}: ComprobanteViewerModalProps) {
  const [token, setToken] = useState<string | null>(propToken || null);
  const [error, setError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isPdf =
    nombreArchivo.toLowerCase().endsWith(".pdf") ||
    (archivoUrl ? archivoUrl.toLowerCase().split("?")[0].endsWith(".pdf") : false);

  const resolveFullUrl = (url: string | null): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const apiBase = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000/api";
    const hostBase = apiBase.replace(/\/api\/?$/, "");
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${hostBase}${cleanUrl}`;
  };

  const fullUrl = resolveFullUrl(archivoUrl);

  // El estado de carga se deriva de forma pura (evita renderizados en cascada en React 19)
  const loading = visible && isPdf && !pdfBase64 && !error;

  useEffect(() => {
    let isCancelled = false;

    if (!visible || !fullUrl || !isPdf) {
      return;
    }

    const timer = setTimeout(() => {
      async function descargarPdf() {
        try {
          let activeToken = token;
          if (!activeToken) {
            activeToken = await getAccessToken();
            if (!isCancelled && activeToken) {
              setToken(activeToken);
            }
          }

          const headers: Record<string, string> = {
            Accept: "application/pdf, application/octet-stream, */*",
          };
          if (activeToken) {
            headers.Authorization = `Bearer ${activeToken}`;
          }

          const response = await fetch(fullUrl, { headers });

          if (!response.ok) {
            throw new Error(
              `No se pudo descargar el archivo (${response.status}: ${response.statusText || "Error del servidor"})`
            );
          }

          const blob = await response.blob();
          const reader = new FileReader();

          reader.onloadend = () => {
            if (isCancelled) return;
            const result = reader.result;
            if (typeof result === "string") {
              const base64Data = result.includes(",") ? result.split(",")[1] : result;
              setPdfBase64(base64Data);
            } else {
              setError("El formato del archivo no es compatible.");
            }
          };

          reader.onerror = () => {
            if (isCancelled) return;
            setError("Error al decodificar los datos del archivo PDF.");
          };

          reader.readAsDataURL(blob);
        } catch (err: unknown) {
          if (isCancelled) return;
          const message =
            err instanceof Error ? err.message : "Error inesperado al cargar el comprobante.";
          setError(message);
        }
      }

      void descargarPdf();
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [visible, fullUrl, isPdf, token, reloadKey]);

  function handleClose() {
    setPdfBase64(null);
    setError(null);
    setPageCount(null);
    onClose();
  }

  function handleRetry() {
    setError(null);
    setPdfBase64(null);
    setReloadKey((prev) => prev + 1);
  }

  const generatePdfHtml = (base64: string): string => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
      <style>
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          background-color: #0F172A;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #F8FAFC;
        }
        #container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 10px 48px 10px;
          gap: 16px;
          width: 100%;
        }
        .page-card {
          position: relative;
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          width: 100%;
          max-width: 800px;
          display: flex;
          justify-content: center;
        }
        canvas {
          display: block;
          width: 100% !important;
          height: auto !important;
        }
        .page-badge {
          position: absolute;
          bottom: 8px;
          right: 10px;
          background: rgba(15, 23, 42, 0.75);
          color: #FFFFFF;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        #loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 260px;
          font-size: 14px;
          color: #94A3B8;
          text-align: center;
          padding: 24px;
        }
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          border-top: 3px solid #38BDF8;
          width: 36px;
          height: 36px;
          animation: spin 0.8s linear infinite;
          margin-bottom: 14px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    </head>
    <body>
      <div id="loader">
        <div class="spinner"></div>
        <span>Renderizando comprobante PDF...</span>
      </div>
      <div id="container"></div>

      <script>
        // Utilizar Fake Worker (ejecución segura en hilo principal de WebView)
        pdfjsLib.GlobalWorkerOptions.workerSrc = false;

        async function renderDocument() {
          try {
            const raw = "${base64}";
            const binary = window.atob(raw);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binary.charCodeAt(i);
            }

            const loadingTask = pdfjsLib.getDocument({ data: bytes });
            const pdf = await loadingTask.promise;
            
            document.getElementById('loader').style.display = 'none';
            const container = document.getElementById('container');

            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGES', count: pdf.numPages }));
            }

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.8 });

              const card = document.createElement('div');
              card.className = 'page-card';

              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              card.appendChild(canvas);

              if (pdf.numPages > 1) {
                const badge = document.createElement('div');
                badge.className = 'page-badge';
                badge.innerText = 'Página ' + pageNum + ' de ' + pdf.numPages;
                card.appendChild(badge);
              }

              container.appendChild(card);

              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
            }
          } catch (err) {
            document.getElementById('loader').innerHTML = '<span style="color:#F87171">Error al procesar el archivo: ' + (err.message || err) + '</span>';
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: String(err) }));
            }
          }
        }

        renderDocument();
      </script>
    </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Cabecera del Visor */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.titleRow}>
                <Ionicons
                  name={isPdf ? "document-text" : "image"}
                  size={20}
                  color={isPdf ? "#DC2626" : "#1D66C2"}
                />
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
              </View>
              <Text style={styles.fileName} numberOfLines={1}>
                {nombreArchivo || "comprobante"}
                {pageCount ? ` • ${pageCount} ${pageCount === 1 ? "pág." : "págs."}` : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeIconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Cuerpo del Visor */}
          <View style={styles.body}>
            {loading ? (
              <View style={styles.centeredState}>
                <ActivityIndicator size="large" color="#1D66C2" />
                <Text style={styles.loadingText}>
                  Descargando comprobante bancario...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.centeredState}>
                <Ionicons name="alert-circle" size={48} color="#DC2626" />
                <Text style={styles.errorTitle}>No se pudo visualizar el comprobante</Text>
                <Text style={styles.errorSub}>{error}</Text>
                <Button
                  title="Reintentar descarga"
                  variant="secondary"
                  onPress={handleRetry}
                  style={styles.retryButton}
                />
              </View>
            ) : isPdf && pdfBase64 ? (
              <WebView
                originWhitelist={["*"]}
                source={{ html: generatePdfHtml(pdfBase64) }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={Platform.OS === "android"}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === "PAGES") {
                      setPageCount(data.count);
                    }
                  } catch {
                    // ignorar mensajes no JSON
                  }
                }}
              />
            ) : !isPdf && fullUrl ? (
              <Image
                source={{
                  uri: fullUrl,
                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }}
                style={styles.imageViewer}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.centeredState}>
                <Ionicons name="document-attach-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>Archivo no disponible.</Text>
              </View>
            )}
          </View>

          {/* Pie del modal */}
          <View style={styles.footer}>
            <Button
              title="Cerrar visor"
              variant="secondary"
              onPress={handleClose}
              style={styles.closeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    padding: 12,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: Math.min(windowHeight * 0.9, 720),
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  fileName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeIconButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  body: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  imageViewer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  errorSub: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 16,
    minWidth: 160,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    width: "100%",
  },
});

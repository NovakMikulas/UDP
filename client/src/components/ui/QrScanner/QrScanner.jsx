import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Modal from "../Modal/Modal";
import "./QrScanner.css";

const VIEWPORT_ID = "qr-scanner-viewport";

const QrScanner = ({ isOpen, onClose, onScan }) => {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5Qrcode(VIEWPORT_ID);

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => onScanRef.current(decodedText),
        () => {} // fires continuously while no QR code is in view - not an error worth surfacing
      )
      .catch((err) => console.error("[QrScanner] Failed to start camera:", err.message || err));

    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan device QR code">
      <div id={VIEWPORT_ID} className="qr-scanner__viewport" />
    </Modal>
  );
};

export default QrScanner;

const API_URL = 'http://localhost:3000';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:3000';

export default function DonationModal({ isOpen, onClose, destinatario }) {
  const [montoSeleccionado, setMontoSeleccionado] = useState(null);
  const [montoCustom, setMontoCustom] = useState('');
  const [message, setMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');

  if (!isOpen) return null;

  const montoActivo = montoCustom ? Number(montoCustom) : montoSeleccionado;

  const resetModal = () => {
    setMontoSeleccionado(null);
    setMontoCustom('');
    setMessage('');
    setPaymentStatus('idle');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const manejarSeleccion = (monto) => {
    setMontoSeleccionado(monto);
    setMontoCustom('');
    setMessage('');
    setPaymentStatus('idle');
  };

  const handlePay = async () => {
    if (!montoActivo || montoActivo < 1) {
      setMessage('Ingresa un valor válido de al menos 1 dólar.');
      return;
    }

    try {
      setMessage('Redirigiendo a Stripe...');

      const res = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ valor: Number(montoActivo) })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo iniciar el pago.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago.');
      }
    } catch (error) {
      setMessage(error.message || 'Error al conectar con Stripe.');
    }
  };

  const handleCancelPayment = () => {
    setPaymentStatus('cancel');
    setMessage('El pago fue cancelado.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1c19]/40 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#9d3d2c]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
            Donar a {destinatario.nombre}
          </h2>
        </div>

        {paymentStatus === 'cancel' ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-lg font-bold text-yellow-700">Pago cancelado</p>
              <p className="text-sm text-yellow-600 mt-2">No se realizó ninguna transacción.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 bg-[#9d3d2c] text-white font-bold rounded-full text-sm hover:bg-[#802919] transition-all shadow-md"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="text-xs font-bold text-[#56423e] ml-1">Selecciona un monto (USD)</label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((monto) => (
                <button
                  key={monto}
                  onClick={() => manejarSeleccion(monto)}
                  className={`py-2 rounded-xl border transition-all font-bold text-sm ${
                    montoSeleccionado === monto
                      ? 'bg-[#9d3d2c] text-white border-[#9d3d2c]'
                      : 'bg-white text-[#56423e] border-[#ddc0bb] hover:border-[#9d3d2c]'
                  }`}
                >
                  ${monto}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Otro monto"
              value={montoCustom}
              onChange={(e) => {
                setMontoCustom(e.target.value);
                setMontoSeleccionado(null);
                setMessage('');
              }}
              className="w-full px-4 py-2 bg-[#f7f3ee] rounded-xl border border-[#ddc0bb] focus:border-[#9d3d2c] outline-none text-sm"
            />

            <button
              type="button"
              onClick={handlePay}
              disabled={!montoSeleccionado && !montoCustom}
              className="w-full py-3 bg-[#9d3d2c] text-white font-bold rounded-full text-sm hover:bg-[#802919] transition-all shadow-md disabled:opacity-50"
            >
              Pagar ${montoActivo}
            </button>

            <button
              type="button"
              onClick={handleCancelPayment}
              className="w-full py-3 bg-white text-[#56423e] font-bold rounded-full text-sm border border-[#ddc0bb] hover:bg-[#f7f3ee] transition-all"
            >
              Cancelar pago
            </button>
          </div>
        )}

        {message && <p className="text-sm text-[#b91c1c] mt-4">{message}</p>}

        <button
          onClick={handleClose}
          className="w-full mt-4 text-xs font-bold text-[#89726d] hover:text-[#9d3d2c]"
        >
          Cancelar donación
        </button>
      </div>
    </div>
  );
}

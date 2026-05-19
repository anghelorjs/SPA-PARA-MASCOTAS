import { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';

interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  onCaptchaIdChange: (id: string) => void;
  error?: string;
}

export const CaptchaInput = ({ value, onChange, onCaptchaIdChange, error }: CaptchaInputProps) => {
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadCaptcha = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/captcha');
      const { captcha_id, image } = response.data;
      
      onCaptchaIdChange(captcha_id);
      setCaptchaUrl(`data:image/jpeg;base64,${image}`);
    } catch (err) {
      console.error('Error loading captcha:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {captchaUrl ? (
            <img
              src={captchaUrl}
              alt="Captcha"
              className="h-12 w-full object-contain bg-gray-100 rounded border border-gray-300"
            />
          ) : (
            <div className="h-12 w-full bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
              <span className="text-sm text-gray-400">Cargando...</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={loadCaptcha}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Recargar captcha"
        >
          <FiRefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ingresa el código de la imagen"
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
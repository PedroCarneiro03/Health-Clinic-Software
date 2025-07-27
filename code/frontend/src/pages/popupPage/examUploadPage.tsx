import React, { useState } from 'react';
import { ExamResultUploadModal } from '@/components/exam-result-upload-popup/exam-result-upload-popup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExamUploadPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpload = (data: {
    uploaderName: string;
    uploaderId: string;
    date: string;
    prescriptionId: string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('userName', data.uploaderName);
    formData.append('userId', data.uploaderId);
    formData.append('date', data.date);
    formData.append('prescriptionId', data.prescriptionId);
    formData.append('file', data.file);

    console.log('Nome:', data.uploaderName);
    console.log('ID Utilizador:', data.uploaderId);
    console.log('Data:', data.date);
    console.log('Prescrição:', data.prescriptionId);
    console.log('Ficheiro:', data.file.name);

    // Exemplo de upload:
    // fetch('/api/exam-results', { method: 'POST', body: formData });

    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Exemplo de Upload de Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Neste exemplo, podes clicar no botão para inserir o ficheiro de resultado de exame.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => setIsOpen(true)}
          >
            Abrir Modal
          </button>
          <ExamResultUploadModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            uploaderName="João Silva"
            uploaderId="123456"
            prescriptionId="RX-7890"
            onSubmit={handleUpload}
          />
        </CardContent>
      </Card>
    </div>
  );
}


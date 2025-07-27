import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Check } from "lucide-react";

type ExamResultUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    uploaderName: string;
    uploaderId: string;
    datePrescribed: string;
    id: string;
    file: File;
  }) => void;
  uploaderName: string;
  uploaderId: string;
  id: string;
};

export function ExamResultUploadModal({
  isOpen,
  onClose,
  onSubmit,
  uploaderName,
  uploaderId,
  id,
}: ExamResultUploadModalProps) {
  const [datePrescribed, setDatePrescribed] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setDatePrescribed(new Date().toISOString().substring(0, 10));
  }, [isOpen]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    onSubmit({
      uploaderName,
      uploaderId,
      datePrescribed,
      id,
      file,
    });
    setFile(null);
  };

  const isFormValid = !!file;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle>Upload de Resultado de Exame</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Nome do Utilizador</Label>
            <p className="mt-1 text-gray-700">{uploaderName}</p>
          </div>
          <div>
            <Label>Identificador</Label>
            <p className="mt-1 text-gray-700">{uploaderId}</p>
          </div>
          <div>
            <Label>Data</Label>
            <p className="mt-1 text-gray-700">{datePrescribed}</p>
          </div>
          <div>
            <Label>ID da Prescrição</Label>
            <p className="mt-1 text-gray-700">{id}</p>
          </div>
          <div>
            <Label htmlFor="exam_result_file">Ficheiro de Resultado</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById('exam_result_file')?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-1" />
                {file ? file.name : 'Selecionar Ficheiro'}
              </Button>
              <input
                type="file"
                id="exam_result_file"
                className="hidden"
                onChange={handleFileChange}
              />
              {file && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            <Check className="w-4 h-4 mr-1" />
            Submeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


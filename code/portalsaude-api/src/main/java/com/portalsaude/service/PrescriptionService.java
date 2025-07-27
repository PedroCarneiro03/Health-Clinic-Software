package com.portalsaude.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.portalsaude.dto.prescriptionDTO.PrescriptionDTO;
import com.portalsaude.dto.prescriptionDTO.PrescriptionMedicationDTO;
import com.portalsaude.model.Doctor;
import com.portalsaude.model.Patient;
import com.portalsaude.model.Prescription;
import com.portalsaude.model.PrescriptionMedication;
import com.portalsaude.repository.PrescriptionRepository;
import com.portalsaude.repository.PrescriptionMedicationRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepo;
    private final PrescriptionMedicationRepository prescriptionMedicationRepo;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public PrescriptionService(PrescriptionRepository prescriptionRepo, 
                              PrescriptionMedicationRepository prescriptionMedicationRepo,
                              PatientService patientService, 
                              DoctorService doctorService) {
        this.prescriptionRepo = prescriptionRepo;
        this.prescriptionMedicationRepo = prescriptionMedicationRepo;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    /**
     * Lista todas as receitas de um paciente.
     */
    @Transactional(readOnly = true)
    public List<Prescription> getPrescriptionsByPatientId(Integer patientId) {
    Assert.notNull(patientId, "Id do paciente é obrigatório");
    return prescriptionRepo.findByPatientId(patientId)
                            .stream()
                            .sorted(Comparator.comparing(Prescription::getId, Comparator.reverseOrder()))
                            .collect(Collectors.toList());
    }

    /**
     * Obtém uma receita por ID.
     */
    @Transactional(readOnly = true)
    public Optional<Prescription> getById(Integer id) {
        return prescriptionRepo.findById(id);
    }

    /**
     * Cria uma nova receita.
     */
    @Transactional
    public Prescription createPrescription(PrescriptionDTO prescriptionDTO) {
        // Validações básicas
        Assert.notNull(prescriptionDTO.getPatientId(), "Id do paciente é obrigatório");
        Assert.notNull(prescriptionDTO.getDoctorId(), "Id do médico é obrigatório");
        Assert.notNull(prescriptionDTO.getDate(), "Data é obrigatória");
        Assert.notEmpty(prescriptionDTO.getMedications(), "Lista de medicamentos não pode estar vazia");

        // Busca entidades relacionadas
        Patient patient = patientService.getById(prescriptionDTO.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado"));
        Doctor doctor = doctorService.getById(prescriptionDTO.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));

        // Cria a Prescription
        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setDate(LocalDate.parse(prescriptionDTO.getDate()));
        prescription.setAdditionalInformation(prescriptionDTO.getAdditionalInformation());
        prescriptionRepo.save(prescription);

        // Converte PrescriptionMedicationDTO para PrescriptionMedication (modelo)
        for (PrescriptionMedicationDTO pmDTO : prescriptionDTO.getMedications()) {
            Assert.notNull(pmDTO.getMedication(), "Medicamento é obrigatório");
            Assert.hasText(pmDTO.getDosage(), "Dosagem é obrigatória");
            Assert.hasText(pmDTO.getFrequency(), "Frequência é obrigatória");
            Assert.hasText(pmDTO.getDuration(), "Duração é obrigatória");

            PrescriptionMedication pm = new PrescriptionMedication();
            pm.setPrescription(prescription);
            pm.setMedication(pmDTO.getMedication());
            pm.setDosage(pmDTO.getDosage());
            pm.setFrequency(pmDTO.getFrequency());
            pm.setDuration(pmDTO.getDuration());
            prescriptionMedicationRepo.save(pm);
        }

        return prescription;
    }

    /**
     * Atualiza uma receita existente.
     */
    @Transactional
    public Prescription updatePrescription(Integer id, PrescriptionDTO prescriptionDTO) {

        Prescription prescription = prescriptionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));


        Assert.notNull(prescriptionDTO.getPatientId(), "Patient ID is required");
        Assert.notNull(prescriptionDTO.getDoctorId(), "Doctor ID is required");
        Assert.notNull(prescriptionDTO.getDate(), "Date is required");

        Patient patient = patientService.getById(prescriptionDTO.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        Doctor doctor = doctorService.getById(prescriptionDTO.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setDate(LocalDate.parse(prescriptionDTO.getDate()));
        prescription.setAdditionalInformation(prescriptionDTO.getAdditionalInformation());


        if (prescriptionDTO.getMedications() != null) {

            prescriptionMedicationRepo.deleteByPrescription_Id(prescription.getId());
            
            for (PrescriptionMedicationDTO pmDTO : prescriptionDTO.getMedications()) {
                Assert.notNull(pmDTO.getMedication(), "Medication is required");
                Assert.hasText(pmDTO.getDosage(), "Dosage is required");
                Assert.hasText(pmDTO.getFrequency(), "Frequency is required");
                Assert.hasText(pmDTO.getDuration(), "Duration is required");

                PrescriptionMedication pm = new PrescriptionMedication();
                pm.setPrescription(prescription);
                pm.setMedication(pmDTO.getMedication());
                pm.setDosage(pmDTO.getDosage());
                pm.setFrequency(pmDTO.getFrequency());
                pm.setDuration(pmDTO.getDuration());
                prescriptionMedicationRepo.save(pm);
            }
        }

        return prescriptionRepo.save(prescription);
    }


    /**
     * Apaga uma receita por ID.
     */
    public void deletePrescription(Integer id) {
        Assert.notNull(id, "Id da receita é obrigatório");
        Optional<Prescription> prescription = prescriptionRepo.findById(id);
        if (prescription.isPresent()) {
            prescriptionMedicationRepo.deleteByPrescription_Id(id);
            prescriptionRepo.deleteById(id);
        } else {
            throw new IllegalArgumentException("Receita não encontrada");
        }
    }

    /**
     * Gera o PDF de uma receita por ID.
     */
    @Transactional(readOnly = true)
    public byte[] generatePrescriptionPdf(Integer id) {
        Assert.notNull(id, "Id da receita é obrigatório");
        
        Prescription prescription = prescriptionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Receita não encontrada"));
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // 1. Configuração do documento
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            //writer.setEncryption(
            //    null,
            //    "password".getBytes(), 
            //    PdfWriter.ALLOW_PRINTING, // permissões (apenas imprimir)
            //    PdfWriter.ENCRYPTION_AES_128 
            //);

            document.open();
            
            // 2. Cabeçalho
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph header = new Paragraph("Receita Médica", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(20f);
            document.add(header);
            
            // 3. Informações da receita
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            
            // 3.1 Dados do paciente
            document.add(new Paragraph("Paciente: " + prescription.getPatient().getName(), valueFont));
            document.add(new Paragraph("Data: " + prescription.getDate().toString(), valueFont));
            document.add(new Paragraph("Médico: " + prescription.getDoctor().getName(), valueFont));
            document.add(new Paragraph(" ")); // Espaçamento
            
            // 3.2 Medicamentos
            document.add(new Paragraph("Medicações Prescritas:", labelFont));
            document.add(new Paragraph(" "));
            
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);
            
            // Cabeçalho da tabela
            table.addCell(new Phrase("Medicamento", labelFont));
            table.addCell(new Phrase("Dosagem", labelFont));
            table.addCell(new Phrase("Frequência", labelFont));
            table.addCell(new Phrase("Duração", labelFont));
            
            // Dados dos medicamentos
            List<PrescriptionMedication> medications = prescriptionMedicationRepo.findByPrescription_Id(id);
            for (PrescriptionMedication pm : medications) {
                table.addCell(new Phrase(pm.getMedication(), valueFont));
                table.addCell(new Phrase(pm.getDosage(), valueFont));
                table.addCell(new Phrase(pm.getFrequency(), valueFont));
                table.addCell(new Phrase(pm.getDuration(), valueFont));
            }
            document.add(table);
            
            // 3.3 Observações
            if (prescription.getAdditionalInformation() != null && !prescription.getAdditionalInformation().isEmpty()) {
                document.add(new Paragraph("Observações:", labelFont));
                document.add(new Paragraph(prescription.getAdditionalInformation(), valueFont));
            }
            
            // 4. Rodapé/Assinatura
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("_________________________________________", valueFont));
            document.add(new Paragraph("Assinatura do Médico", valueFont));
            
            document.close();
            return baos.toByteArray();
            
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Erro ao gerar PDF da receita", e);
        }
    }


    /**
     * Obtém os medicamentos associados a uma receita por ID.
     */
    @Transactional(readOnly = true)
    public List<PrescriptionMedication> getMedicationsByPrescriptionId(Integer prescriptionId) {
        Assert.notNull(prescriptionId, "Id da receita é obrigatório");
        return prescriptionMedicationRepo.findByPrescription_Id(prescriptionId);
    }
}
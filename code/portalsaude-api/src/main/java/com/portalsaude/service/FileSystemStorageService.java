package com.portalsaude.service;

import com.portalsaude.config.StorageProperties;

import jakarta.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    public FileSystemStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        String extension = Path.of(file.getOriginalFilename()).getFileName().toString();
        String filename = UUID.randomUUID() + "-" + extension;
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            Path destinationFile = this.rootLocation.resolve(
                Paths.get(filename))
                .normalize().toAbsolutePath();

            // Copy file
            Files.copy(file.getInputStream(), destinationFile,
                       StandardCopyOption.REPLACE_EXISTING);

            // Return relative path or URL
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}
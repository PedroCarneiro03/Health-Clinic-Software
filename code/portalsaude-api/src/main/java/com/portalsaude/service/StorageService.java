package com.portalsaude.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Store the given file and return the path or filename to be persisted in DB.
     */
    String store(MultipartFile file);
}
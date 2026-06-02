package com.sofagames.backend;
import java.time.LocalDateTime;

public record LibraryItemDTO(
    Long steamAppId,
    String name,
    String headerImage,
    LocalDateTime purchasedAt
){}
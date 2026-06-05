package com.sofagames.backend.checkout.service;

import com.sofagames.backend.auth.entity.User;
import com.sofagames.backend.auth.repository.UserRepository;
import com.sofagames.backend.cart.entity.CartItem;
import com.sofagames.backend.cart.repository.CartItemRepository;
import com.sofagames.backend.checkout.dto.CheckoutResponseDTO;
import com.sofagames.backend.checkout.entity.Purchase;
import com.sofagames.backend.checkout.repository.PurchaseRepository;
import com.sofagames.backend.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CheckoutService {

    private final CartItemRepository cartItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public CheckoutService(CartItemRepository cartItemRepository,
            PurchaseRepository purchaseRepository,
            UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CheckoutResponseDTO checkout(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("El carrito está vacío");
        }

        OffsetDateTime now = OffsetDateTime.now();

        List<Purchase> purchases = cartItems.stream()
                .filter(item -> !purchaseRepository.existsByUserIdAndGameId(userId, item.getGame().getId()))
                .map(item -> Purchase.builder()
                        .user(user)
                        .game(item.getGame())
                        .pricePaid(item.getGame().getPriceFinal())
                        .purchasedAt(now)
                        .build())
                .toList();

        purchaseRepository.saveAll(purchases);
        cartItemRepository.deleteAll(cartItems);

        String orderId = "SOF4-" + now.toLocalDate().toString().replace("-", "") + "-"
                + String.format("%03d", (int) (Math.random() * 1000));

        int total = purchases.stream().mapToInt(Purchase::getPricePaid).sum();
        String currency = cartItems.get(0).getGame().getCurrency() != null
                ? cartItems.get(0).getGame().getCurrency()
                : "CLP";

        List<CheckoutResponseDTO.PurchasedGameDTO> gameDTOs = purchases.stream()
                .map(p -> new CheckoutResponseDTO.PurchasedGameDTO(
                        p.getGame().getId(),
                        p.getGame().getName(),
                        p.getGame().getHeaderImage(),
                        p.getPricePaid()))
                .toList();

        return new CheckoutResponseDTO(orderId, gameDTOs, total, currency, now);
    }
}
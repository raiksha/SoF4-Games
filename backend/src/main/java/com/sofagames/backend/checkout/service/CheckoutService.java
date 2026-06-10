package com.sofagames.backend.checkout.service;

import com.sofagames.backend.auth.entity.User;
import com.sofagames.backend.auth.repository.UserRepository;
import com.sofagames.backend.cart.entity.CartItem;
import com.sofagames.backend.cart.repository.CartItemRepository;
import com.sofagames.backend.checkout.dto.CheckoutRequestDTO;
import com.sofagames.backend.checkout.dto.CheckoutResponseDTO;
import com.sofagames.backend.checkout.entity.Purchase;
import com.sofagames.backend.checkout.repository.PurchaseRepository;
import com.sofagames.backend.coupon.entity.Coupon;
import com.sofagames.backend.coupon.repository.CouponRepository;
import com.sofagames.backend.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartItemRepository cartItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public CheckoutResponseDTO checkout(UUID userId, CheckoutRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("El carrito está vacío");
        }

        int subtotal = cartItems.stream()
                .filter(item -> !purchaseRepository.existsByUserIdAndGameId(userId, item.getGame().getId()))
                .mapToInt(item -> item.getGame().getPriceFinal())
                .sum();

        // Resolve coupon discount
        int discountPercent = 0;
        if (request != null && request.coupon() != null && !request.coupon().isBlank()) {
            Coupon coupon = couponRepository
                    .findByCodeIgnoreCaseAndIsActiveTrue(request.coupon().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Cupón no válido"));
            discountPercent = coupon.getDiscountPercent();
        }

        int discount = (int) Math.round(subtotal * discountPercent / 100.0);
        int total = subtotal - discount;

        // Resolve payment
        String paymentMethod = request != null && request.paymentMethod() != null
                ? request.paymentMethod()
                : "card";

        if (total > 0) {
            if ("wallet".equals(paymentMethod)) {
                if (user.getWalletBalance() < total) {
                    throw new IllegalStateException("Saldo insuficiente en tu wallet");
                }
                user.setWalletBalance(user.getWalletBalance() - total);
                userRepository.save(user);
            } else {
                throw new IllegalStateException("Se requiere un cupón válido o saldo en wallet para completar la compra");
            }
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

        if (purchases.isEmpty()) {
            throw new IllegalStateException("Todos los juegos ya fueron comprados");
        }

        purchaseRepository.saveAll(purchases);
        cartItemRepository.deleteAll(cartItems);

        String orderId = "SOF4-" + now.toLocalDate().toString().replace("-", "") + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

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

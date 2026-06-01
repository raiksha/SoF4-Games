package com.sofagames.backend.friendship.service;

import com.sofagames.backend.auth.entity.User;
import com.sofagames.backend.auth.repository.UserRepository;
import com.sofagames.backend.friendship.model.Friendship;
import com.sofagames.backend.friendship.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    /**
     * Envía una solicitud de amistad del usuario autenticado hacia addresseeId.
     *
     * @param requesterId UUID del usuario que envía (viene del JWT, no del body)
     * @param addresseeId UUID del usuario que recibe (viene del body)
     * @return la Friendship recién creada con status = "PENDING"
     */
    public Friendship sendRequest(UUID requesterId, UUID addresseeId) {

        // Regla 1: no puedes enviarte una solicitud a ti mismo
        if (requesterId.equals(addresseeId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "No puedes agregarte a ti mismo");
        }

        // Regla 2: no puede existir una solicitud en ninguna dirección (A→B ni B→A)
        boolean alreadyExists =
                friendshipRepository.existsByRequesterIdAndAddresseeId(requesterId, addresseeId) ||
                        friendshipRepository.existsByRequesterIdAndAddresseeId(addresseeId, requesterId);

        if (alreadyExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Solicitud ya existente");
        }

        // Cargamos ambos usuarios para asignarlos a la entidad
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario solicitante no encontrado"));

        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario destinatario no encontrado"));

        // Creamos y guardamos la solicitud con status = "PENDING"
        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status("PENDING")
                .build();

        return friendshipRepository.save(friendship);
    }

    /**
     * Acepta una solicitud de amistad existente.
     * Solo el addressee (quien recibió la solicitud) puede aceptarla.
     *
     * @param friendshipId ID de la fila en friendships
     * @param userId       UUID del usuario autenticado (debe ser el addressee)
     * @return la Friendship actualizada con status = "ACCEPTED"
     */
    public Friendship acceptRequest(Long friendshipId, UUID userId) {

        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Solicitud de amistad no encontrada"));

        // Solo el destinatario puede aceptar — no el que la envió
        if (!friendship.getAddressee().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Solo el destinatario puede aceptar esta solicitud");
        }

        friendship.setStatus("ACCEPTED");
        return friendshipRepository.save(friendship);
    }
}
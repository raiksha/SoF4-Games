package com.sofagames.backend.friendship.repository;

import com.sofagames.backend.friendship.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // ¿Ya existe una solicitud de A hacia B?
    boolean existsByRequesterIdAndAddresseeId(UUID requesterId, UUID addresseeId);

    // Todos los amigos aceptados de un usuario (en ambas direcciones).
    // Usamos @Query porque el nombre del método sería demasiado ambiguo para Spring.
    @Query("""
            SELECT f FROM Friendship f
            WHERE (f.requester.id = :userId OR f.addressee.id = :userId)
              AND f.status = :status
            """)
    List<Friendship> findAcceptedFriendships(@Param("userId") UUID userId,
                                             @Param("status") String status);
}
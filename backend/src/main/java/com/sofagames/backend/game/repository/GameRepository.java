package com.sofagames.backend.game.repository;

import com.sofagames.backend.game.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    List<Game> findByDiscountPercentGreaterThanOrderByDiscountPercentDesc(
            Integer discountPercent,
            Pageable pageable
    );

    List<Game> findAllByOrderByReleaseDateDesc(
            Pageable pageable
    );

    List<Game> findAllByOrderByTotalPositiveDesc(
            Pageable pageable
    );

    List<Game> findAllByOrderByRecommendationsTotalDesc(
            Pageable pageable
    );
}

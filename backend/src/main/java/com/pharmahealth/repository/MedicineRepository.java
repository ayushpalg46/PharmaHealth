package com.pharmahealth.repository;

import com.pharmahealth.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByCategoryId(Long categoryId);

    @Query("SELECT m FROM Medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Medicine> searchMedicines(@Param("query") String query);
}

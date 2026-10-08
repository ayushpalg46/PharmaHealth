package com.pharmahealth.repository;

import com.pharmahealth.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserIdOrderByBillDateDesc(Long userId);
    List<Bill> findAllByOrderByBillDateDesc();
    Optional<Bill> findByOrderId(Long orderId);
}

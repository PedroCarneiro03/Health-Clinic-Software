package com.portalsaude.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.portalsaude.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
}

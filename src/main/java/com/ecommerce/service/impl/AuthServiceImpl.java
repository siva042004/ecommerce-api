package com.ecommerce.service.impl;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtUtil;
import com.ecommerce.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(User.Role.CUSTOMER)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword())
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
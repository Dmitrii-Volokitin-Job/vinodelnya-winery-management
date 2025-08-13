package com.vinodelnya.winery.service;

import com.vinodelnya.winery.dto.PageResponse;
import com.vinodelnya.winery.dto.UserDto;
import com.vinodelnya.winery.entity.User;
import com.vinodelnya.winery.exception.EntityInUseException;
import com.vinodelnya.winery.exception.EntityNotFoundException;
import com.vinodelnya.winery.mapper.UserMapper;
import com.vinodelnya.winery.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@PreAuthorize("hasRole('ADMIN')")
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public PageResponse<UserDto> findAll(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        List<UserDto> content = users.getContent().stream()
                .map(userMapper::toDto)
                .toList();
        
        return new PageResponse<>(
                content,
                users.getTotalElements(),
                users.getTotalPages(),
                users.getNumber(),
                users.getSize(),
                users.isFirst(),
                users.isLast()
        );
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public UserDto findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    public UserDto create(@Valid UserDto userDto) {
        if (userRepository.existsByUsername(userDto.username())) {
            throw new IllegalArgumentException("Username already exists: " + userDto.username());
        }

        User user = userMapper.toEntity(userDto);
        
        // Encrypt password
        if (userDto.password() != null && !userDto.password().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.password()));
        } else {
            throw new IllegalArgumentException("Password is required for new users");
        }
        
        User savedUser = userRepository.save(user);
        log.info("Created new user: {}", savedUser.getUsername());
        return userMapper.toDto(savedUser);
    }

    public UserDto update(Long id, @Valid UserDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // Check if username is being changed and if it's already taken
        if (!existingUser.getUsername().equals(userDto.username()) && 
            userRepository.existsByUsername(userDto.username())) {
            throw new IllegalArgumentException("Username already exists: " + userDto.username());
        }

        userMapper.updateEntityFromDto(userDto, existingUser);
        
        // Update password only if provided
        if (userDto.password() != null && !userDto.password().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDto.password()));
        }
        
        User updatedUser = userRepository.save(existingUser);
        log.info("Updated user: {}", updatedUser.getUsername());
        return userMapper.toDto(updatedUser);
    }

    public void deleteById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // Prevent deletion of the last admin user
        if (user.getRole() == User.Role.ADMIN && userRepository.countByRoleAndActiveTrue(User.Role.ADMIN) <= 1) {
            throw new EntityInUseException("Cannot delete the last active admin user");
        }
        
        userRepository.deleteById(id);
        log.info("Deleted user: {}", user.getUsername());
    }

    public UserDto activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        
        user.setActive(true);
        User updatedUser = userRepository.save(user);
        log.info("Activated user: {}", updatedUser.getUsername());
        return userMapper.toDto(updatedUser);
    }

    public UserDto deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // Prevent deactivation of the last admin user
        if (user.getRole() == User.Role.ADMIN && userRepository.countByRoleAndActiveTrue(User.Role.ADMIN) <= 1) {
            throw new EntityInUseException("Cannot deactivate the last active admin user");
        }
        
        user.setActive(false);
        User updatedUser = userRepository.save(user);
        log.info("Deactivated user: {}", updatedUser.getUsername());
        return userMapper.toDto(updatedUser);
    }
}
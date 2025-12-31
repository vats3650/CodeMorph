import { MigrationConfig } from './types';

export const DEFAULT_MIGRATION_CONFIG: MigrationConfig = {
  sourceTechs: ['Java 8', 'Spring Boot 1.5', 'JUnit 4'],
  targetTechs: ['Java 17', 'Spring Boot 3.2', 'JUnit 5', 'Spring Security 6']
};

export const SAMPLE_LEGACY_CODE = `package com.legacy.app.security;

import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;

public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
            .withUser("admin").password("password").roles("ADMIN");
    }
    
    // TODO: Verify deprecated methods
}`;

export const MODEL_NAME = 'gemini-3-pro-preview';

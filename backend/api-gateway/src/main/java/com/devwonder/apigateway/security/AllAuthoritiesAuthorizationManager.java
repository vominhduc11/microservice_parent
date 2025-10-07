package com.devwonder.apigateway.security;

import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.security.core.Authentication;
import reactor.core.publisher.Mono;

public class AllAuthoritiesAuthorizationManager implements ReactiveAuthorizationManager<AuthorizationContext> {

    private final String[] requiredAuthorities;

    public AllAuthoritiesAuthorizationManager(String... requiredAuthorities) {
        this.requiredAuthorities = requiredAuthorities;
    }

    @Override
    public Mono<AuthorizationDecision> check(Mono<Authentication> authentication, AuthorizationContext context) {
        return authentication
                .map(auth -> {
                    boolean hasAll = true;
                    for (String authority : requiredAuthorities) {
                        if (auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals(authority))) {
                            hasAll = false;
                            break;
                        }
                    }
                    return new AuthorizationDecision(hasAll);
                })
                .defaultIfEmpty(new AuthorizationDecision(false));
    }
}
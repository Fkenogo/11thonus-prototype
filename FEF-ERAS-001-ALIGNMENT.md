# 11thONUS — FEF-ERAS-001 Alignment

**Status:** Aligned  
**Date:** 18 September 2026  
**Framework reference:** FEF-ERAS-001 — Experience Reference & Assembly Standard

## Purpose

This repository is the 11thONUS Experience Reference. It establishes the intended multi-role product experience while the main `Fkenogo/11THONUS` repository remains authoritative for Product Truth, engine behaviour, architecture, security, commercial logic and implementation.

## Product Truth Authority

The main 11thONUS repository remains authoritative for:

- Business, Customer/Participant and Platform Administrator domain semantics;
- Reward Program, purchase, Verified Unit, Cycle, Reward and redemption rules;
- business activation and participation terms;
- permissions, identity and role authority;
- Commerce Knowledge and canonical qualification semantics;
- billing/consumption rules;
- data, security, architecture and engineering decisions.

Prototype behaviour must not silently modify those authorities.

## Experience Reference Authority

This repository may govern the intended experience for:

- Business Owner and Manager operating surfaces;
- frontline staff/counter experience;
- participant/customer experience;
- onboarding and role transitions;
- command-centre hierarchy;
- mobile-first business operation;
- navigation, contextual actions and interaction patterns;
- visual representation of loyalty/circle progress.

The production product should preserve the experience architecture where compatible with Product Truth, while replacing prototype state and mock behaviour with real 11thONUS data, permissions and commands.

## Material Assumptions

Under FEF-ERAS-001, prototype concepts must be treated as ADOPT / ADAPT / REFERENCE / REJECT / UNRESOLVED where material.

In particular:

- walk-in registration, purchase recording and reward actions must bind to the real domain/permission model before production use;
- prototype role switching is review navigation, not production authority;
- mobile-first Business Owner/Manager treatment is an experience requirement, not a new domain rule;
- prototype data structures and convenience actions do not create new commercial or loyalty semantics;
- unresolved redemption, content or governance matters remain controlled by the main project repository.

## Implementation Expectation

When 11thONUS reaches experience-assembly work:

1. use this repository as the experience baseline rather than recreating role surfaces independently;
2. map prototype interactions to real domain commands, reads, permissions and lifecycle state;
3. classify material mismatch explicitly instead of silently changing Product Truth or discarding the experience;
4. assemble vertical flows from Business configuration through frontline/customer action to resulting loyalty state;
5. verify relevant Business Owner/Manager flows on mobile as part of Founder product review.

## Non-Effects

This alignment does not authorise new product scope, redemption mechanics, commercial rules, architecture decisions or production implementation. It records how the Experience Reference should guide future assembly under FEF-ERAS-001.

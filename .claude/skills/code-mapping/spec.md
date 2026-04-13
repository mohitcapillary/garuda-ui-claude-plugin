# System Mapping Specification (React + Redux + Saga)

---

## 🎯 Purpose

This document defines a strict output structure to map:
- UI (React Components)
- State Management (Redux Store)
- Side Effects (Redux Saga)
- APIs & Data Flow

It enables:
- PRD → Code impact analysis
- Debugging of state + async flows
- Clear traceability from UI → Action → Reducer → Saga → API → State → UI

---

## 🧭 1. System Overview

- **Purpose:**  
- **Core Flow Summary (UI → Redux → Saga → API → State → UI):**  
- **Key Business Entities:**  
- **State Management Strategy:**  
  - Global (Redux):  
  - Local (Component State):  
- **Side Effect Handling:** (Redux Saga)  
- **External Dependencies:**  
- **Assumptions:**  

---

## 📄 2. Page-Level Mapping

### Page: <Page Name / Route>

- **Route Path:** /example  
- **Description:**  
- **User Actions:**  
  - <Action> → Dispatch <ACTION_TYPE>  
- **Main Components:**  
- **Redux Usage:**  
  - State Selected (useSelector):  
  - Actions Dispatched:  
- **Sagas Triggered:**  
- **APIs Called:**  
- **Data Lifecycle:**  
  - Input → Process → Output  

---

## 🧩 3. Component Mapping (React)

### Component: <Component Name>

- **Type:** (Page | Container | Presentational | Hook)  
- **Description:**  
- **Used In:**  
- **Props:**  
- **Local State (useState):**  
- **Redux Integration:**  
  - useSelector:  
  - useDispatch:  
- **Actions Triggered:**  
- **Side Effects (useEffect):**  
- **Child Components:**  
- **Re-render Triggers:**  
- **Performance Notes (if any):**  

---

## 🗂️ 4. Redux Store Mapping

### Slice: <Slice Name>

- **Purpose:**  
- **Initial State:**  
{}

- **State Fields:**  
  - field_name: description  
- **Reducers:**  
  - <ACTION_TYPE>: what it does  
- **Selectors:**  
  - <selector_name> → what it returns  
- **Used In Components:**  

---

## ⚡ 5. Redux Saga Mapping

### Saga: <Saga Name>

- **Triggered By (Action):**  
- **Purpose:**  
- **Flow:**  
  1. Listen (takeLatest / takeEvery)  
  2. Call API (call)  
  3. Handle Response (put success/failure)  
- **API Calls:**  
- **Error Handling:**  
- **Connected Reducers:**  
- **Concurrency Model:** (takeLatest / takeEvery / throttle)  

---

## 🌐 6. API Mapping

### API: <API Name>

- **Endpoint:** /api/...  
- **Method:** GET | POST | PUT | DELETE  
- **Called From Saga:**  
- **Purpose:**  

- **Request Payload:**  
{}

- **Response:**  
{}

- **Error Cases:**  
- **Mapped To Redux State:**  
- **Used By Components:**  

---

## 🔄 7. End-to-End Data Flow (CRITICAL)

### Flow: <Flow Name>

1. **User Action (UI):**  
2. **Component Dispatch:**  
   - Action Type:  
3. **Reducer (if applicable):**  
4. **Saga Triggered:**  
5. **API Call:**  
6. **API Response:**  
7. **Redux State Update:**  
8. **Component Re-render:**  
9. **Final UI State:**  

---

## 📦 8. Data Model / Entities

### Entity: <Entity Name>

{}

- **Field Descriptions:**  
- **Source:** (API / Derived / User Input)  
- **Stored In Redux?:**  
- **Used In Components:**  

---

## 🔗 9. Dependency Mapping

- Page → Components  
- Component → Redux (Slice + Actions)  
- Component → Saga  
- Saga → API  
- API → Redux State  
- Redux State → Component  

---

## ⚠️ 10. Gaps & Assumptions

- Missing Documentation:  
- ⚠️ Assumed Flows:  
- Unclear Redux Logic:  
- Unclear Saga Behavior:  
- Required Clarifications:  

---

## 🧠 11. PRD Impact Mapping Guide (VERY IMPORTANT)

When a PRD is provided, analyze impact across:

### 🔍 Impact Detection Steps

1. UI Changes
2. State Changes
3. Action Changes
4. Saga Changes
5. API Changes
6. Data Flow Changes

---

### 📌 Output Format for PRD Impact

- Impacted Pages:  
- Impacted Components:  
- Impacted Redux Slices:  
- Impacted Sagas:  
- Impacted APIs:  
- Data Model Changes:  
- Data Flow Changes:  
- Risk Areas:  

---

## 📌 Output Rules (STRICT)

1. Follow this structure exactly  
2. Do NOT skip sections (write "N/A" if needed)  
3. Clearly mark assumptions using: ⚠️ Assumed  
4. Maintain traceability: Component → Action → Saga → API → State → Component  
5. Use consistent naming  
6. Prefer bullet points  
7. Keep output concise  

---

## ✅ Expected Outcome

- System blueprint  
- Debugging map  
- PRD impact tool  
- Developer onboarding reference  

---

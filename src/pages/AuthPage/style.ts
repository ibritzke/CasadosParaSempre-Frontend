import styled, { keyframes } from "styled-components";

export const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

export const Screen = styled.div`
  min-height: 100%;
  background: linear-gradient(160deg, #5c1f3e 0%, #8b3a62 55%, #c4709a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 40px;
  max-width: 430px;
  margin: 0 auto;
`;

export const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.5s ease;

  .rings {
    font-size: 56px;
    display: block;
    margin-bottom: 14px;
  }
  h1 {
    font-family: "Playfair Display", serif;
    color: #fff;
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
  }
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-top: 6px;
  }
`;

export const AuthCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 28px 24px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
  animation: ${fadeIn} 0.5s ease 0.1s both;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: #f5e6ee;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$active ? "#fff" : "transparent")};
  color: ${(p) => (p.$active ? "#8B3A62" : "#7A5C68")};
  box-shadow: ${(p) => (p.$active ? "0 2px 8px rgba(139,58,98,0.08)" : "none")};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

export const Label = styled.label`
  font-size: 11px;
  font-weight: 500;
  color: #7a5c68;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const InputEl = styled.input`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid rgba(139, 58, 98, 0.18);
  border-radius: 10px;
  font-size: 15px;
  color: #2a1a1f;
  background: #fdf8f4;
  outline: none;
  transition: border-color 0.2s;
  &:focus {
    border-color: #8b3a62;
  }
  &::placeholder {
    color: #b09aa6;
  }
`;

export const SelectEl = styled.select`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid rgba(139, 58, 98, 0.18);
  border-radius: 10px;
  font-size: 15px;
  color: #2a1a1f;
  background: #fdf8f4;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A5C68' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
  &:focus {
    border-color: #8b3a62;
  }
`;

export const PrimaryBtn = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #8b3a62, #5c1f3e);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  transition: all 0.18s;
  margin-top: 6px;
  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const GoogleBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: #fff;
  border: 1.5px solid rgba(139, 58, 98, 0.18);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.2s;
  margin-top: 10px;
  &:hover {
    background: #fdf8f4;
  }
`;

// Complete profile modal (after Google login)
export const CompleteOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(44, 10, 25, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
`;

export const CompleteCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 380px;
`;
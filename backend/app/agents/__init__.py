from .oil_market import oil_market_agent
from .shipping_logistics import shipping_logistics_agent
from .insurance_risk import insurance_risk_agent
from .banking_liquidity import banking_liquidity_agent
from .gcc_fiscal import gcc_fiscal_agent

AGENT_REGISTRY = {
    "OilMarketAgent": oil_market_agent,
    "ShippingLogisticsAgent": shipping_logistics_agent,
    "InsuranceRiskAgent": insurance_risk_agent,
    "BankingLiquidityAgent": banking_liquidity_agent,
    "GCCFiscalAgent": gcc_fiscal_agent,
}

__all__ = ["AGENT_REGISTRY"]

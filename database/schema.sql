CREATE TABLE IF NOT EXISTS support_requests (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Open'
        CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO support_requests (customer_name, category, description, status)
SELECT 'Aarav Mehta', 'Account access', 'Unable to sign in after password reset', 'In Progress'
WHERE NOT EXISTS (SELECT 1 FROM support_requests);

INSERT INTO support_requests (customer_name, category, description, status)
SELECT 'Priya Sharma', 'Billing', 'Please clarify the latest invoice amount', 'Open'
WHERE NOT EXISTS (SELECT 1 FROM support_requests WHERE customer_name = 'Priya Sharma');

INSERT INTO support_requests (customer_name, category, description, status)
SELECT 'Rohan Das', 'Technical support', 'Mobile dashboard does not load', 'Resolved'
WHERE NOT EXISTS (SELECT 1 FROM support_requests WHERE customer_name = 'Rohan Das');

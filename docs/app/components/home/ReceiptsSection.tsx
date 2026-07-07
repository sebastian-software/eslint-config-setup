import { Link } from "react-router"

import { REPO_URL } from "./configuratorData"

const BLOB_URL = `${REPO_URL}/blob/main`

type ExternalReceipt = {
  detail: string
  href: string
  value: string
}

type InternalReceipt = {
  detail: string
  to: string
  value: string
}

const EXTERNAL_RECEIPTS: ExternalReceipt[] = [
  {
    value: "202",
    detail: "tests, including end-to-end runs against every permutation",
    href: `${REPO_URL}/tree/main/packages/eslint-config/src/__tests__`,
  },
  {
    value: "16,603",
    detail: "lines of rule snapshot — every rule of every config, reviewed in diffs",
    href: `${BLOB_URL}/packages/eslint-config/src/__tests__/__snapshots__/snapshots.test.ts.snap`,
  },
  {
    value: "3 OS × Node 22/24 + Bun",
    detail: "the CI matrix every release passes",
    href: `${BLOB_URL}/.github/workflows/ci.yml`,
  },
  {
    value: "0",
    detail: "lint errors on its own codebase, checked with its own strictest config",
    href: `${BLOB_URL}/eslint.config.js`,
  },
]

const INTERNAL_RECEIPTS: InternalReceipt[] = [
  {
    value: "16 + 8",
    detail: "ESLint and OxLint configs pre-generated, named by hash",
    to: "/guide/architecture",
  },
  {
    value: "24",
    detail: "architecture decision records, rejections included",
    to: "/adr",
  },
  {
    value: "30",
    detail: "plugins resolved, pinned, and reconciled into one ruleset",
    to: "/guide/plugins",
  },
]

export function ReceiptsSection() {
  return (
    <section aria-labelledby="hp-receipts-title" className="hp-section">
      <div className="hp-container">
        <div className="hp-section-head">
          <h2 className="hp-section-title" id="hp-receipts-title">
            No logo wall yet. Here&apos;s what we have instead.
          </h2>
        </div>
        <p className="hp-section-lead">
          Every number below links to the artifact behind it. Nothing here is a
          marketing estimate.
        </p>
        <ul className="hp-receipts">
          {INTERNAL_RECEIPTS.map((receipt) => (
            <li className="hp-receipt" key={receipt.value}>
              <Link className="hp-receipt-link" to={receipt.to}>
                <span className="hp-receipt-value">{receipt.value}</span>
                <span className="hp-receipt-detail">{receipt.detail}</span>
              </Link>
            </li>
          ))}
          {EXTERNAL_RECEIPTS.map((receipt) => (
            <li className="hp-receipt" key={receipt.value}>
              <a
                className="hp-receipt-link"
                href={receipt.href}
                rel="noreferrer"
                target="_blank"
              >
                <span className="hp-receipt-value">{receipt.value}</span>
                <span className="hp-receipt-detail">{receipt.detail}</span>
              </a>
            </li>
          ))}
        </ul>
        <aside className="hp-pratfall">
          <p>
            This is v0.5 and it is opinionated. One candidate plugin brought 29 rules;
            after evaluation we adopted zero —{" "}
            <Link to="/adr/0018-no-shopify">the rejection is documented</Link>.
            Curation is mostly saying no. When you genuinely need an exception,{" "}
            <Link to="/guide/rule-api">rule helpers</Link> are the escape hatch — a
            small API, not a fork.
          </p>
          <p>
            If you want a config that adapts to your taste, this isn&apos;t it. If you
            want one that&apos;s finished deciding, install it.
          </p>
        </aside>
      </div>
    </section>
  )
}

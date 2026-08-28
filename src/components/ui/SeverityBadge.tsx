import Chip from "./Chip";

export function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === "Critica" ? "critical" : severity === "Importante" ? "warm" : "brand";
  return <Chip tone={tone}>{severity}</Chip>;
}

export default SeverityBadge;
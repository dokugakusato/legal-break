#!/bin/bash
# 試験用プロジェクトの課金と「予算を超えたら止める」設定を確認する（見るだけ。何も変えない）
P=legal-break-battle-test
echo "== 課金の状態"; gcloud billing projects describe $P --format='value(billingEnabled,billingAccountName)'
BA=$(gcloud billing projects describe $P --format='value(billingAccountName.basename())')
echo "== Pub/Sub トピック"; gcloud pubsub topics list --project $P --format='value(name)'
echo "== 予算"; gcloud billing budgets list --billing-account=$BA --format='yaml(displayName,amount,notificationsRule.pubsubTopic,thresholdRules)' 2>&1 | head -40
echo "== 止める仕組み（関数）"; gcloud functions list --project $P --regions asia-northeast1 --format='value(name,state,eventTrigger.pubsubTopic)' 2>&1 | head

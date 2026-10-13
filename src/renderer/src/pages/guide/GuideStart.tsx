import React from 'react'
import { DEFAULT_MIXED_PORT } from '../../../../shared/path-line'
import { GuidePage, GuideSection } from './shared'

export const GuideStart: React.FC = () => (
  <GuidePage title="快速开始" lead={`本地端口 ${DEFAULT_MIXED_PORT}。先填账号，再开模式。`}>
    <GuideSection title="四步上手">
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          解压发放包，双击 <code className="text-fx-accent">path-one.exe</code>。
        </li>
        <li>杀毒拦截时选择允许或信任。</li>
        <li>
          在左侧「账号」填写开通通知中的端口、账号、密码并保存；可用「测试国内 / 国外」。
        </li>
        <li>打开「浏览器模式」。需要 Git / 命令行时，再开「全局模式」（须先启动系统服务）。</li>
      </ol>
    </GuideSection>

    <GuideSection title="左侧导航怎么用">
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong className="text-fx-text">操作</strong>
          ：账号、浏览器模式、全局模式、路由分流、系统服务、内核日志 —— 日常点这里。
        </li>
        <li>
          <strong className="text-fx-text">说明</strong>
          ：快速开始、确认已通、常见问题 —— 短文，按需打开，不必一次读完。
        </li>
        <li>每个操作页底部或中部都有「本页说明」，与当前功能对照即可。</li>
      </ul>
    </GuideSection>
  </GuidePage>
)

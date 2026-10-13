import React from 'react'
import { GuidePage, GuideSection } from './shared'

export const GuideVerify: React.FC = () => (
  <GuidePage title="确认已通" lead="用检测页或账号页的「测试国外」核对线路是否生效。">
    <GuideSection title="推荐步骤">
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          （可选）打开前访问 <code className="text-fx-accent">https://ip-api.com</code>，记下
          Country。
        </li>
        <li>在「账号」保存信息，点「测试国外」看结果。</li>
        <li>打开「浏览器模式」，刷新检测页；国家 / 地区应与开通说明一致。</li>
        <li>
          备用：<code className="text-fx-accent">https://ip.sb</code>、
          <code className="text-fx-accent">https://ifconfig.me</code>。
        </li>
        <li>国内站与本地系统应仍可访问。若网页全挂：到「浏览器模式」点「救急：关系统代理」。</li>
      </ol>
    </GuideSection>

    <GuideSection title="现象对照">
      <ul className="list-disc pl-5 space-y-2">
        <li>检测页地区未变 → 确认程序在运行且浏览器模式已开。</li>
        <li>提示先保存账号 → 回「账号」填写并保存。</li>
        <li>测试国外失败 → 已保存账号 + 已开模式 + 内核运行中。</li>
        <li>仅 Git / 命令行不通 → 系统服务启动后开全局模式。</li>
        <li>全局模式开不了 → 「系统服务」安装 / 启动，权限点「是」。</li>
      </ul>
    </GuideSection>
  </GuidePage>
)

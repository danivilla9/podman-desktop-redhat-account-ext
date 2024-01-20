/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/
import { isMac, isWindows } from './util';
import * as extensionApi from '@podman-desktop/api';

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

const PODMAN_COMMANDS = {
  SM_VERSION: () => 'ssh subscription-manager --version'.split(' '),
  DNF_INSTALL_SM: () => 'ssh sudo rpm-ostree install -y subscription-manager'.split(' `'),
  SM_ACTIVATE_SUBS: (activationKeyName: string, orgId: string) =>
    `ssh sudo subscription-manager register --activationkeys ${activationKeyName} ---org ${orgId}`.split(' '),
  MACHINE_STOP: () => 'podman machine stop'.split(' '),
  MACHINE_START: () => 'podman machine start'.split(' '),
}

export function getInstallationPath(): string | undefined {
  const env = process.env;
  if (isWindows()) {
    return `c:\\Program Files\\RedHat\\Podman;${env.PATH}`;
  } else if (isMac()) {
    if (!env.PATH) {
      return macosExtraPath;
    } else {
      return env.PATH.concat(':').concat(macosExtraPath);
    }
  } else {
    return env.PATH;
  }
}

export function getPodmanCli(): string {
  // If we have a custom binary path regardless if we are running Windows or not
  const customBinaryPath = getCustomBinaryPath();
  if (customBinaryPath) {
    return customBinaryPath;
  }

  if (isWindows()) {
    return 'podman.exe';
  }
  return 'podman';
}

// Get the Podman binary path from configuration podman.binary.path
// return string or undefined
export function getCustomBinaryPath(): string | undefined {
  return extensionApi.configuration.getConfiguration('podman').get('binary.path');
}

export interface InstalledPodman {
  version: string;
}

export async function getSubscriptionManagerVersion(): Promise<InstalledPodman | undefined> {
  try {
    const { stdout: versionOut } = await extensionApi.process.exec(getPodmanCli(), []);
    const versionArr = versionOut.split(' ');
    const version = versionArr[versionArr.length - 1];
    return { version };
  } catch (err) {
    // no podman binary
    return undefined;
  }
}

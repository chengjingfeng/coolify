import shell from 'shelljs';
import User from '$models/User';
import jsonwebtoken from 'jsonwebtoken';
import { saveServerLog } from './applications/logging';

export function execShellAsync(cmd, opts = {}) {
	try {
		return new Promise(function (resolve, reject) {
			shell.config.silent = true;
			shell.exec(cmd, opts, async function (code, stdout, stderr) {
				if (code !== 0) {
					await saveServerLog({ message: JSON.stringify({ cmd, opts, code, stdout, stderr }) })
					return reject(new Error(stderr));
				}
				return resolve(stdout);
			});
		});
	} catch (error) {
		return new Error('Oops');
	}
}
export function cleanupTmp(dir) {
	if (dir !== '/') shell.rm('-fr', dir);
}

export async function verifyUserId(token) {
	const { JWT_SIGN_KEY } = process.env;
	try {
		const verify = jsonwebtoken.verify(token, JWT_SIGN_KEY);
		const found = await User.findOne({ uid: verify.jti });
		if (found) {
			return Promise.resolve(true);
		} else {
			return Promise.reject(false);
		}
	} catch (error) {
		console.log(error);
		return Promise.reject(false);
	}
}

export function delay(t) {
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve('OK');
		}, t);
	});
}
